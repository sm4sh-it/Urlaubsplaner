import { BudgetExpense, BudgetCategory, BudgetParticipant, ParticipantBalance, DebtSettlement } from "@/types"

export const DEFAULT_BUDGET_CATEGORIES = [
  { name: "Unterkunft", icon: "home", color: "#3b82f6" },
  { name: "Transport & Mobility", icon: "car", color: "#8b5cf6" },
  { name: "Verpflegung & Gastro", icon: "utensils", color: "#10b981" },
  { name: "Aktivitäten & Kultur", icon: "ticket", color: "#f59e0b" },
  { name: "Shopping & Souvenirs", icon: "shopping-bag", color: "#ec4899" },
  { name: "Sonstiges", icon: "tag", color: "#64748b" },
]

/**
 * Formatiert Beträge standardkonform im de-DE Format mit Währungssymbol
 */
export function formatCurrency(amount: number | null | undefined, currency: string = "EUR"): string {
  const val = amount ?? 0
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF" : currency
  
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val) + " " + symbol
}

/**
 * Berechnet die Gesamtsumme aller Ausgaben eines Reise-Budgets
 */
export function calculateTotalExpenses(expenses: BudgetExpense[]): number {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
}

export interface CategoryBreakdownItem {
  id: string
  name: string
  icon: string
  color: string
  amount: number
  percent: number
  count: number
}

/**
 * Aggregiert alle Ausgaben nach Kategorien inkl. Prozentanteilen
 */
export function calculateCategoryBreakdown(
  expenses: BudgetExpense[],
  categories: BudgetCategory[]
): CategoryBreakdownItem[] {
  const total = calculateTotalExpenses(expenses)
  const categoryMap = new Map<string, { amount: number; count: number }>()

  // Map Categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { amount: 0, count: 0 })
  })
  categoryMap.set("uncategorized", { amount: 0, count: 0 })

  // Sum up expenses
  expenses.forEach((exp) => {
    const key = exp.categoryId || "uncategorized"
    const current = categoryMap.get(key) || { amount: 0, count: 0 }
    categoryMap.set(key, {
      amount: current.amount + (exp.amount || 0),
      count: current.count + 1,
    })
  })

  const results: CategoryBreakdownItem[] = []

  categories.forEach((cat) => {
    const data = categoryMap.get(cat.id)
    if (data && data.amount > 0) {
      results.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || "tag",
        color: cat.color || "#64748b",
        amount: data.amount,
        percent: total > 0 ? (data.amount / total) * 100 : 0,
        count: data.count,
      })
    }
  })

  // Uncategorized if any
  const uncategorizedData = categoryMap.get("uncategorized")
  if (uncategorizedData && uncategorizedData.amount > 0) {
    results.push({
      id: "uncategorized",
      name: "Ohne Kategorie",
      icon: "help-circle",
      color: "#94a3b8",
      amount: uncategorizedData.amount,
      percent: total > 0 ? (uncategorizedData.amount / total) * 100 : 0,
      count: uncategorizedData.count,
    })
  }

  // Sort descending by amount
  return results.sort((a, b) => b.amount - a.amount)
}

/**
 * Berechnet den individuellen Saldo pro Teilnehmer (Bezahlt - Eigenanteil = Saldo)
 */
export function calculateParticipantBalances(
  participants: BudgetParticipant[],
  expenses: BudgetExpense[]
): ParticipantBalance[] {
  const paidMap = new Map<string, number>()
  const shareMap = new Map<string, number>()

  participants.forEach((p) => {
    paidMap.set(p.id, 0)
    shareMap.set(p.id, 0)
  })

  expenses.forEach((exp) => {
    // Add paid amount
    if (exp.payerId) {
      const currentPaid = paidMap.get(exp.payerId) || 0
      paidMap.set(exp.payerId, currentPaid + (exp.amount || 0))
    }

    // Add splits / shares
    if (exp.splits && exp.splits.length > 0) {
      exp.splits.forEach((split) => {
        const currentShare = shareMap.get(split.participantId) || 0
        shareMap.set(split.participantId, currentShare + (split.amount || 0))
      })
    }
  })

  return participants.map((participant) => {
    const totalPaid = Math.round((paidMap.get(participant.id) || 0) * 100) / 100
    const totalShare = Math.round((shareMap.get(participant.id) || 0) * 100) / 100
    const netBalance = Math.round((totalPaid - totalShare) * 100) / 100

    return {
      participant,
      totalPaid,
      totalShare,
      netBalance,
    }
  })
}

/**
 * Greedy Debt Minimization: Berechnet die kleinstmögliche Anzahl an Ausgleichstransaktionen
 */
export function calculateSmartSettlements(
  participants: BudgetParticipant[],
  expenses: BudgetExpense[]
): DebtSettlement[] {
  const balances = calculateParticipantBalances(participants, expenses)
  const participantMap = new Map<string, BudgetParticipant>(participants.map((p) => [p.id, p]))

  // Separate in Creditors (+) and Debtors (-)
  interface BalanceEntry {
    id: string
    balance: number
  }

  const creditors: BalanceEntry[] = []
  const debtors: BalanceEntry[] = []

  balances.forEach((b) => {
    const rounded = Math.round(b.netBalance * 100) / 100
    if (rounded > 0.005) {
      creditors.push({ id: b.participant.id, balance: rounded })
    } else if (rounded < -0.005) {
      debtors.push({ id: b.participant.id, balance: rounded })
    }
  })

  // Sort: biggest creditor first, biggest debtor (most negative) first
  creditors.sort((a, b) => b.balance - a.balance)
  debtors.sort((a, b) => a.balance - b.balance)

  const settlements: DebtSettlement[] = []

  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const cred = creditors[i]
    const deb = debtors[j]

    const amount = Math.min(cred.balance, -deb.balance)
    const roundedAmount = Math.round(amount * 100) / 100

    if (roundedAmount > 0.005) {
      const fromP = participantMap.get(deb.id)
      const toP = participantMap.get(cred.id)

      if (fromP && toP) {
        settlements.push({
          from: fromP,
          to: toP,
          amount: roundedAmount,
        })
      }
    }

    cred.balance -= roundedAmount
    deb.balance += roundedAmount

    if (cred.balance <= 0.005) i++
    if (-deb.balance <= 0.005) j++
  }

  return settlements
}

/**
 * Berechnet die durchschnittlichen Kosten pro Reisetag
 */
export function calculateDailyAverage(
  expenses: BudgetExpense[],
  startDate?: string | null,
  endDate?: string | null
): { avgPerDay: number; daysCount: number } {
  const total = calculateTotalExpenses(expenses)
  if (total === 0) return { avgPerDay: 0, daysCount: 0 }

  if (startDate && endDate) {
    const s = new Date(startDate)
    const e = new Date(endDate)
    const diffTime = Math.abs(e.getTime() - s.getTime())
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
    return {
      avgPerDay: total / diffDays,
      daysCount: diffDays,
    }
  }

  // Fallback: Number of distinct expense dates
  const distinctDates = new Set(expenses.map((e) => e.date).filter(Boolean))
  const daysCount = Math.max(1, distinctDates.size)
  return {
    avgPerDay: total / daysCount,
    daysCount,
  }
}
