import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ensureDefaultProfile } from "@/lib/ensureDefaultProfile"
import StoreHydrator from "@/components/StoreHydrator"
import BudgetDetailView from "@/components/Budget/BudgetDetailView"
import { CalendarEntry, EntryType, Trip, TripBudget } from "@/types"

export const dynamic = "force-dynamic"

interface BudgetDetailPageProps {
  params: Promise<{
    tripBudgetId: string
  }>
}

export async function generateMetadata({ params }: BudgetDetailPageProps): Promise<Metadata> {
  const { tripBudgetId } = await params
  const budget = await prisma.tripBudget.findUnique({
    where: { id: tripBudgetId },
    select: { name: true },
  })

  return {
    title: budget ? `${budget.name} - Budget & Reisekosten` : "Reise-Budget - Urlaubsplaner",
    description: "Detaillierte Kostenverwaltung, Ausgabensplits und Saldenausgleich.",
  }
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { tripBudgetId } = await params

  const profilesRaw = await ensureDefaultProfile()
  const entriesRaw = await prisma.entry.findMany()
  const overrides = await prisma.profileYearOverride.findMany()
  const tripsRaw = await prisma.trip.findMany({
    include: { profiles: true },
    orderBy: { startDate: "asc" },
  })

  const budgetRaw = await prisma.tripBudget.findUnique({
    where: { id: tripBudgetId },
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

  if (!budgetRaw) {
    notFound()
  }

  // Sicherstellen, dass die Standard-Kategorie "Ausgleich" für bestehende Budgets existiert
  const hasAusgleich = budgetRaw.categories.some(
    (c) => c.name.trim().toLowerCase() === "ausgleich"
  )
  if (!hasAusgleich) {
    const ausgleichCat = await prisma.budgetCategory.create({
      data: {
        budgetId: budgetRaw.id,
        name: "Ausgleich",
        icon: "arrow-right-left",
        color: "#06b6d4",
      },
    })
    budgetRaw.categories.push(ausgleichCat as any)
  }

  // Format Types
  const entries: CalendarEntry[] = entriesRaw.map((e: any) => ({
    id: e.id,
    date: e.date,
    type: e.type as EntryType,
    profileId: e.profileId,
  }))

  const trips: Trip[] = tripsRaw.map((t: any) => ({
    ...t,
    profiles: t.profiles.map((p: any) => ({ id: p.id })),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  const currentYear = budgetRaw.startDate
    ? new Date(budgetRaw.startDate).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex-1 w-full h-full bg-transparent overflow-y-auto overflow-x-hidden custom-scrollbar">
      <StoreHydrator
        profiles={profilesRaw}
        entries={entries}
        overrides={overrides}
        trips={trips}
      />
      <BudgetDetailView
        budget={budgetRaw as unknown as TripBudget}
        allProfiles={profilesRaw}
        allTrips={trips}
      />
    </div>
  )
}
