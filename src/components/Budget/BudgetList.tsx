"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  DollarSign,
  Wallet,
  Calendar,
  Users,
  Plane,
  Receipt,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Profile, Trip, TripBudget } from "@/types"
import { formatCurrency, calculateTotalExpenses } from "@/lib/budgetUtils"
import { deleteTripBudget } from "@/app/actions/budgetActions"
import CreateBudgetModal from "./CreateBudgetModal"

interface BudgetListProps {
  budgets: TripBudget[]
  trips: Trip[]
  profiles: Profile[]
  initialYear: number
}

export default function BudgetList({
  budgets,
  trips,
  profiles,
  initialYear,
}: BudgetListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [budgetToEdit, setBudgetToEdit] = useState<TripBudget | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Extract distinct years from budgets
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    budgets.forEach((b) => {
      if (b.startDate) years.add(new Date(b.startDate).getFullYear())
      else if (b.trip?.startDate) years.add(new Date(b.trip.startDate).getFullYear())
      else years.add(new Date(b.createdAt).getFullYear())
    })
    years.add(initialYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [budgets, initialYear])

  // Filter & Sort budgets
  const filteredBudgets = useMemo(() => {
    const list = budgets.filter((b) => {
      // Search match
      const matchSearch =
        searchTerm.trim() === "" ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.trip?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

      // Year match
      if (!matchSearch) return false
      if (yearFilter === "all") return true

      const bYear = b.startDate
        ? new Date(b.startDate).getFullYear()
        : b.trip?.startDate
        ? new Date(b.trip.startDate).getFullYear()
        : new Date(b.createdAt).getFullYear()

      return bYear.toString() === yearFilter
    })

    // Sort by trip/budget start date ascending
    return list.sort((a, b) => {
      const dateA = a.startDate || a.trip?.startDate || (typeof a.createdAt === "string" ? a.createdAt : a.createdAt.toISOString())
      const dateB = b.startDate || b.trip?.startDate || (typeof b.createdAt === "string" ? b.createdAt : b.createdAt.toISOString())
      return dateA.localeCompare(dateB)
    })
  }, [budgets, searchTerm, yearFilter])

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalSpent = filteredBudgets.reduce(
      (sum, b) => sum + calculateTotalExpenses(b.expenses),
      0
    )
    const totalBudgetLimit = filteredBudgets.reduce(
      (sum, b) => sum + (b.totalBudget || 0),
      0
    )
    const totalExpensesCount = filteredBudgets.reduce(
      (sum, b) => sum + b.expenses.length,
      0
    )

    return {
      totalSpent,
      totalBudgetLimit,
      totalExpensesCount,
      budgetCount: filteredBudgets.length,
    }
  }, [filteredBudgets])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Möchtest du das Reise-Budget "${name}" wirklich unwiderruflich löschen?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteTripBudget(id)
      router.refresh()
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
      alert("Fehler beim Löschen des Budgets.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (budget: TripBudget) => {
    setBudgetToEdit(budget)
    setIsCreateModalOpen(true)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Budget- &amp; Reisekosten
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verwalte Reisebudgets, erfasse gemeinsame Ausgaben und begleiche Salden transparent.
          </p>
        </div>

        <button
          onClick={() => {
            setBudgetToEdit(null)
            setIsCreateModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#161f28]/70 hover:bg-[#fafafa] dark:hover:bg-[#1e2a36]/90 border border-slate-300 dark:border-slate-700/80 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-500/10 active:translate-y-0 active:scale-[0.98] transition-all duration-300 backdrop-blur-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-500 shrink-0" />
          <span>Neues Reise-Budget</span>
        </button>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Gesamtausgaben
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(overallStats.totalSpent)}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            in {overallStats.budgetCount} Reise-Budgets
          </span>
        </div>

        {/* Total Budget Limit (if any) */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Geplantes Budgetlimit
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {overallStats.totalBudgetLimit > 0
                ? formatCurrency(overallStats.totalBudgetLimit)
                : "Kein Limit"}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {overallStats.totalBudgetLimit > 0
              ? `${Math.round((overallStats.totalSpent / overallStats.totalBudgetLimit) * 100)}% ausgeschöpft`
              : "Kein Limit hinterlegt"}
          </span>
        </div>

        {/* Expenses Count */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Erfasste Ausgaben
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {overallStats.totalExpensesCount}
            </span>
            <span className="text-xs font-medium text-slate-400">Belege &amp; Posten</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ø {overallStats.budgetCount > 0 ? (overallStats.totalExpensesCount / overallStats.budgetCount).toFixed(1) : 0} pro Reise
          </span>
        </div>

        {/* Active Budgets */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reise-Budgets
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {filteredBudgets.length}
            </span>
            <span className="text-xs font-medium text-slate-400">aktiv</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {yearFilter === "all" ? "Alle Jahre" : `im Jahr ${yearFilter}`}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Reise oder Teilnehmer suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border-none bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Alle Jahre</option>
            {availableYears.map((y) => (
              <option key={y} value={y.toString()}>
                Jahr {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-center p-6">
          <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 mb-4">
            <DollarSign className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Keine Reise-Budgets gefunden
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6">
            {searchTerm || yearFilter !== "all"
              ? "Keine Ergebnisse für deine aktuellen Filterkriterien. Passe die Suche an oder setze die Filter zurück."
              : "Lege dein erstes Reise-Budget an, um Ausgaben unterwegs festzuhalten und mit Reisepartnern aufzuteilen."}
          </p>
          <button
            onClick={() => {
              setBudgetToEdit(null)
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jetzt Budget anlegen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const totalSpent = calculateTotalExpenses(budget.expenses)
            const hasLimit = budget.totalBudget && budget.totalBudget > 0
            const percentUsed = hasLimit
              ? Math.min(100, (totalSpent / budget.totalBudget!) * 100)
              : 0
            const isOverBudget = hasLimit && totalSpent > budget.totalBudget!

            return (
              <div
                key={budget.id}
                className="group relative bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/budget/${budget.id}`}
                        className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-brand-500 transition-colors line-clamp-1"
                      >
                        {budget.name}
                      </Link>

                      {/* Dates or Linked Trip */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {budget.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {budget.startDate}
                            {budget.endDate ? ` - ${budget.endDate}` : ""}
                          </span>
                        )}
                        {budget.trip && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-medium">
                            <Plane className="w-3 h-3 text-brand-500" />
                            {budget.trip.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions dropdown/buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Budget bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id, budget.name)}
                        disabled={deletingId === budget.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Budget löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="my-5 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Gesamtausgaben
                      </span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                        {formatCurrency(totalSpent, budget.currency)}
                      </span>
                    </div>

                    {/* Progress bar if budget limit exists */}
                    {hasLimit && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          <span>Limit: {formatCurrency(budget.totalBudget, budget.currency)}</span>
                          <span className={isOverBudget ? "text-rose-500 font-bold" : ""}>
                            {Math.round((totalSpent / budget.totalBudget!) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverBudget
                                ? "bg-rose-500"
                                : percentUsed > 85
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Participants & Link */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Participants avatare stack */}
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="flex -space-x-1.5 overflow-hidden py-1">
                      {budget.participants.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#0d1117] flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: p.color || "#3b82f6" }}
                          title={p.name}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {budget.participants.length > 4 && (
                        <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#0d1117] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          +{budget.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {budget.expenses.length} Posten
                    </span>
                  </div>

                  {/* Go to Details Link */}
                  <Link
                    href={`/budget/${budget.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal for creating / editing budget */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setBudgetToEdit(null)
        }}
        profiles={profiles}
        trips={trips}
        selectedYear={initialYear}
        budgetToEdit={budgetToEdit}
      />
    </div>
  )
}
