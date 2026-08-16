"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { DEFAULT_BUDGET_CATEGORIES, calculateTotalExpenses } from "@/lib/budgetUtils"
import { z } from "zod"

// --- Zod Validation Schemas ---

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const createBudgetSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  currency: z.string().default("EUR"),
  totalBudget: z.number().nullable().optional(),
  startDate: z.string().regex(dateRegex, "Ungültiges Startdatum").nullable().optional(),
  endDate: z.string().regex(dateRegex, "Ungültiges Enddatum").nullable().optional(),
  tripId: z.string().nullable().optional(),
  initialParticipants: z.array(
    z.object({
      profileId: z.string().nullable().optional(),
      name: z.string().min(1),
      color: z.string().nullable().optional(),
    })
  ).optional(),
})

const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().optional(),
  totalBudget: z.number().nullable().optional(),
  startDate: z.string().regex(dateRegex).nullable().optional(),
  endDate: z.string().regex(dateRegex).nullable().optional(),
  tripId: z.string().nullable().optional(),
})

const participantSchema = z.object({
  profileId: z.string().nullable().optional(),
  name: z.string().min(1, "Name ist erforderlich").max(50),
  color: z.string().nullable().optional(),
})

const categorySchema = z.object({
  name: z.string().min(1, "Kategorie-Name erforderlich").max(50),
  icon: z.string().default("tag"),
  color: z.string().default("#3b82f6"),
})

const expenseSplitSchema = z.object({
  participantId: z.string(),
  amount: z.number().min(0),
})

const expenseSchema = z.object({
  title: z.string().min(1, "Titel erforderlich").max(100),
  amount: z.number().min(0.01, "Betrag muss größer als 0 sein"),
  date: z.string().regex(dateRegex, "Ungültiges Datum"),
  notes: z.string().max(500).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  payerId: z.string().min(1, "Zahler ist erforderlich"),
  splits: z.array(expenseSplitSchema).min(1, "Mindestens ein Teilnehmer muss beteiligt sein"),
})

// --- Server Actions ---

/**
 * Ruft alle Reise-Budgets ab
 */
export async function getTripBudgets(year?: number) {
  try {
    const budgets = await prisma.tripBudget.findMany({
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            country: true,
            location: true,
            status: true,
          },
        },
        participants: true,
        expenses: {
          include: {
            category: true,
            splits: true,
          },
        },
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (year !== undefined) {
      return {
        success: true,
        data: budgets.filter((b) => {
          if (b.startDate) {
            return new Date(b.startDate).getFullYear() === year
          }
          if (b.trip?.startDate) {
            return new Date(b.trip.startDate).getFullYear() === year
          }
          return new Date(b.createdAt).getFullYear() === year
        }),
      }
    }

    return { success: true, data: budgets }
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Budgets:", error)
    return { success: false, error: error.message || "Fehler beim Laden der Budgets" }
  }
}

/**
 * Ruft ein einzelnes Budget mit allen Details ab
 */
export async function getTripBudgetById(id: string) {
  try {
    const budget = await prisma.tripBudget.findUnique({
      where: { id },
      include: {
        trip: true,
        participants: {
          include: {
            profile: true,
          },
        },
        categories: true,
        expenses: {
          include: {
            category: true,
            payer: true,
            splits: {
              include: {
                participant: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!budget) {
      return { success: false, error: "Budget nicht gefunden" }
    }

    // Sicherstellen, dass die Standard-Kategorie "Ausgleich" für bestehende Budgets existiert
    const hasAusgleich = budget.categories.some(
      (c) => c.name.trim().toLowerCase() === "ausgleich"
    )
    if (!hasAusgleich) {
      const ausgleichCat = await prisma.budgetCategory.create({
        data: {
          budgetId: budget.id,
          name: "Ausgleich",
          icon: "arrow-right-left",
          color: "#06b6d4",
        },
      })
      budget.categories.push(ausgleichCat as any)
    }

    return { success: true, data: budget }
  } catch (error: any) {
    console.error("Fehler beim Abrufen des Budgets:", error)
    return { success: false, error: error.message || "Fehler beim Laden" }
  }
}

/**
 * Erstellt ein neues Reise-Budget inkl. Standardkategorien & Teilnehmer
 */
export async function createTripBudget(input: z.infer<typeof createBudgetSchema>) {
  try {
    const parsed = createBudgetSchema.parse(input)

    const budget = await prisma.tripBudget.create({
      data: {
        name: parsed.name,
        currency: parsed.currency,
        totalBudget: parsed.totalBudget,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        tripId: parsed.tripId || null,
        categories: {
          create: DEFAULT_BUDGET_CATEGORIES.map((cat) => ({
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
          })),
        },
        participants: {
          create: (parsed.initialParticipants || []).map((p) => ({
            profileId: p.profileId || null,
            name: p.name,
            color: p.color || null,
          })),
        },
      },
      include: {
        participants: true,
        categories: true,
      },
    })

    revalidatePath("/budget")
    return { success: true, data: budget }
  } catch (error: any) {
    console.error("Fehler beim Erstellen des Budgets:", error)
    return { success: false, error: error.message || "Fehler beim Erstellen" }
  }
}

/**
 * Aktualisiert Budget-Metadaten
 */
export async function updateTripBudget(id: string, input: z.infer<typeof updateBudgetSchema>) {
  try {
    const parsed = updateBudgetSchema.parse(input)

    const budget = await prisma.tripBudget.update({
      where: { id },
      data: {
        ...parsed,
        tripId: parsed.tripId === undefined ? undefined : parsed.tripId || null,
      },
    })

    revalidatePath("/budget")
    revalidatePath(`/budget/${id}`)
    return { success: true, data: budget }
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren des Budgets:", error)
    return { success: false, error: error.message || "Fehler beim Speichern" }
  }
}

/**
 * Löscht ein Reise-Budget
 */
export async function deleteTripBudget(id: string) {
  try {
    await prisma.tripBudget.delete({
      where: { id },
    })

    revalidatePath("/budget")
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Löschen des Budgets:", error)
    return { success: false, error: error.message || "Fehler beim Löschen" }
  }
}

/**
 * Fügt einen Teilnehmer zu einem Budget hinzu
 */
export async function addBudgetParticipant(budgetId: string, input: z.infer<typeof participantSchema>) {
  try {
    const parsed = participantSchema.parse(input)

    const participant = await prisma.budgetParticipant.create({
      data: {
        budgetId,
        profileId: parsed.profileId || null,
        name: parsed.name,
        color: parsed.color || null,
      },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, data: participant }
  } catch (error: any) {
    console.error("Fehler beim Hinzufügen des Teilnehmers:", error)
    return { success: false, error: error.message || "Fehler beim Hinzufügen" }
  }
}

/**
 * Entfernt einen Teilnehmer aus einem Budget
 */
export async function deleteBudgetParticipant(participantId: string, budgetId: string) {
  try {
    await prisma.budgetParticipant.delete({
      where: { id: participantId },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Entfernen des Teilnehmers:", error)
    return { success: false, error: error.message || "Fehler beim Löschen" }
  }
}

/**
 * Erstellt eine neue benutzerdefinierte Kategorie
 */
export async function createBudgetCategory(budgetId: string, input: z.infer<typeof categorySchema>) {
  try {
    const parsed = categorySchema.parse(input)

    const category = await prisma.budgetCategory.create({
      data: {
        budgetId,
        name: parsed.name,
        icon: parsed.icon,
        color: parsed.color,
      },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, data: category }
  } catch (error: any) {
    console.error("Fehler beim Anlegen der Kategorie:", error)
    return { success: false, error: error.message || "Fehler beim Anlegen" }
  }
}

/**
 * Löscht eine Kategorie
 */
export async function deleteBudgetCategory(categoryId: string, budgetId: string) {
  try {
    await prisma.budgetCategory.delete({
      where: { id: categoryId },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Löschen der Kategorie:", error)
    return { success: false, error: error.message || "Fehler beim Löschen" }
  }
}

/**
 * Stellt alle fehlenden Standard-Kategorien für ein Budget wieder her
 */
export async function restoreDefaultBudgetCategories(budgetId: string) {
  try {
    const existing = await prisma.budgetCategory.findMany({
      where: { budgetId },
    })

    const existingNames = new Set(
      existing.map((c) => c.name.trim().toLowerCase())
    )

    const missing = DEFAULT_BUDGET_CATEGORIES.filter(
      (cat) => !existingNames.has(cat.name.trim().toLowerCase())
    )

    if (missing.length > 0) {
      await prisma.budgetCategory.createMany({
        data: missing.map((cat) => ({
          budgetId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        })),
      })
    }

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, count: missing.length }
  } catch (error: any) {
    console.error("Fehler beim Wiederherstellen der Standardkategorien:", error)
    return { success: false, error: error.message || "Fehler beim Wiederherstellen" }
  }
}

/**
 * Erfasst eine neue Ausgabe inkl. Splits
 */
export async function addBudgetExpense(budgetId: string, input: z.infer<typeof expenseSchema>) {
  try {
    const parsed = expenseSchema.parse(input)

    const expense = await prisma.budgetExpense.create({
      data: {
        budgetId,
        title: parsed.title,
        amount: parsed.amount,
        date: parsed.date,
        notes: parsed.notes || null,
        categoryId: parsed.categoryId || null,
        payerId: parsed.payerId,
        splits: {
          create: parsed.splits.map((s) => ({
            participantId: s.participantId,
            amount: s.amount,
          })),
        },
      },
      include: {
        splits: true,
        category: true,
        payer: true,
      },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, data: expense }
  } catch (error: any) {
    console.error("Fehler beim Erfassen der Ausgabe:", error)
    return { success: false, error: error.message || "Fehler beim Speichern" }
  }
}

/**
 * Aktualisiert eine bestehende Ausgabe
 */
export async function updateBudgetExpense(expenseId: string, budgetId: string, input: z.infer<typeof expenseSchema>) {
  try {
    const parsed = expenseSchema.parse(input)

    const expense = await prisma.$transaction(async (tx) => {
      // 1. Delete old splits
      await tx.expenseSplit.deleteMany({
        where: { expenseId },
      })

      // 2. Update Expense & create new splits
      return await tx.budgetExpense.update({
        where: { id: expenseId },
        data: {
          title: parsed.title,
          amount: parsed.amount,
          date: parsed.date,
          notes: parsed.notes || null,
          categoryId: parsed.categoryId || null,
          payerId: parsed.payerId,
          splits: {
            create: parsed.splits.map((s) => ({
              participantId: s.participantId,
              amount: s.amount,
            })),
          },
        },
        include: {
          splits: true,
          category: true,
          payer: true,
        },
      })
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, data: expense }
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren der Ausgabe:", error)
    return { success: false, error: error.message || "Fehler beim Speichern" }
  }
}

/**
 * Löscht eine Ausgabe
 */
export async function deleteBudgetExpense(expenseId: string, budgetId: string) {
  try {
    await prisma.budgetExpense.delete({
      where: { id: expenseId },
    })

    revalidatePath(`/budget/${budgetId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Löschen der Ausgabe:", error)
    return { success: false, error: error.message || "Fehler beim Löschen" }
  }
}

/**
 * Manueller Sync: Überträgt die Gesamtausgaben dieses Budgets in das verknüpfte Trip.cost-Feld
 */
export async function syncTripCostWithBudget(budgetId: string) {
  try {
    const budget = await prisma.tripBudget.findUnique({
      where: { id: budgetId },
      include: {
        categories: true,
        expenses: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!budget) {
      return { success: false, error: "Budget nicht gefunden" }
    }

    if (!budget.tripId) {
      return { success: false, error: "Dieses Budget ist mit keiner Reise im Kalender verknüpft." }
    }

    const totalCost = calculateTotalExpenses(budget.expenses as any, budget.categories as any)

    const updateData: { cost: number; budget?: number | null } = {
      cost: totalCost,
    }

    if (budget.totalBudget !== undefined) {
      updateData.budget = budget.totalBudget
    }

    await prisma.trip.update({
      where: { id: budget.tripId },
      data: updateData,
    })

    revalidatePath("/")
    revalidatePath("/calendar")
    revalidatePath("/statistics")
    revalidatePath(`/budget/${budgetId}`)

    const budgetMsg = budget.totalBudget ? ` & Budgetlimit (${budget.totalBudget.toFixed(2)} €)` : ""

    return {
      success: true,
      totalCost,
      totalBudget: budget.totalBudget,
      message: `Tatsächliche Kosten (${totalCost.toFixed(2)} €)${budgetMsg} erfolgreich in die verknüpfte Reise übertragen!`,
    }
  } catch (error: any) {
    console.error("Fehler beim Synchronisieren der Reisekosten:", error)
    return { success: false, error: error.message || "Fehler beim Synchronisieren" }
  }
}
