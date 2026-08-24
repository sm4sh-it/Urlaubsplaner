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
import AvatarGroup from "@/components/ui/AvatarGroup"
import EmptyState from "@/components/ui/EmptyState"
import { useStore } from "@/store/useStore"

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
      (sum, b) => sum + calculateTotalExpenses(b.expenses, b.categories),
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
      useStore.getState().addToast({
        type: "info",
        title: "Budget gelöscht",
        description: `Reise-Budget "${name}" wurde entfernt.`,
      })
      router.refresh()
    } catch (err: any) {
      console.error("Fehler beim Löschen:", err)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Löschen",
        description: err.message || "Das Reise-Budget konnte nicht gelöscht werden.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (budget: TripBudget) => {
    setBudgetToEdit(budget)
    setIsCreateModalOpen(true)
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6 md:gap-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Budget- &amp; Reisekosten
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verwalte Reisebudgets, erfasse gemeinsame Ausgaben und begleiche Salden transparent.
          </p>
        </div>

        <button
          onClick={() => {
            setBudgetToEdit(null)
            setIsCreateModalOpen(true)
          }}
          className="btn-glass inline-flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-500 shrink-0" />
          <span>Neues Reise-Budget</span>
        </button>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Gesamtausgaben
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(overallStats.totalSpent)}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            in {overallStats.budgetCount} Reise-Budgets
          </span>
        </div>

        {/* Total Budget Limit */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Geplantes Budgetlimit
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
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
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Erfasste Ausgaben
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {overallStats.totalExpensesCount}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Belege &amp; Posten</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ø {overallStats.budgetCount > 0 ? (overallStats.totalExpensesCount / overallStats.budgetCount).toFixed(1) : 0} pro Reise
          </span>
        </div>

        {/* Active Budgets */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reise-Budgets
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {filteredBudgets.length}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">aktiv</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {yearFilter === "all" ? "Alle Jahre" : `im Jahr ${yearFilter}`}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Reise oder Teilnehmer suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
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
        <EmptyState
          variant={searchTerm || yearFilter !== "all" ? "subwell" : "card"}
          icon={Wallet}
          title={budgets.length === 0 ? "Noch keine Reise-Budgets vorhanden" : "Keine Reise-Budgets gefunden"}
          description={
            budgets.length === 0
              ? "Lege dein erstes Reise-Budget an, um Ausgaben unterwegs festzuhalten und mit Reisepartnern aufzuteilen."
              : "Passe deine Suchbegriffe oder den Jahresfilter an."
          }
          actionLabel={
            budgets.length === 0
              ? "Jetzt Budget anlegen"
              : searchTerm || yearFilter !== "all"
              ? "Filter zurücksetzen"
              : undefined
          }
          onAction={() => {
            if (budgets.length === 0) {
              setBudgetToEdit(null)
              setIsCreateModalOpen(true)
            } else {
              setSearchTerm("")
              setYearFilter("all")
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const totalSpent = calculateTotalExpenses(budget.expenses, budget.categories)
            const hasLimit = budget.totalBudget && budget.totalBudget > 0
            const percentUsed = hasLimit
              ? Math.min(100, (totalSpent / budget.totalBudget!) * 100)
              : 0
            const isOverBudget = hasLimit && totalSpent > budget.totalBudget!

            return (
              <div
                key={budget.id}
                className="group relative bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-brand-500/40 rounded-2xl sm:rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/budget/${budget.id}`}>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                          {budget.name}
                        </h3>
                      </Link>

                      {/* Dates or Linked Trip */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {budget.startDate && (
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {budget.startDate} {budget.endDate ? `- ${budget.endDate}` : ""}
                          </span>
                        )}
                        {budget.trip && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                  <div className="my-5 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Gesamtausgaben
                      </span>
                      <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                        {formatCurrency(totalSpent, budget.currency)}
                      </span>
                    </div>

                    {/* Progress bar if budget limit exists */}
                    {hasLimit && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          <span className="font-mono">Limit: {formatCurrency(budget.totalBudget, budget.currency)}</span>
                          <span className={isOverBudget ? "text-rose-500 font-bold font-mono" : "font-mono"}>
                            {Math.round((totalSpent / budget.totalBudget!) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
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
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  {/* Participants avatar stack */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <AvatarGroup
                      profiles={budget.participants.map(p => ({
                        id: p.id,
                        name: p.name,
                        color: p.color || "#0284c7",
                      }))}
                      size="xs"
                      max={4}
                    />
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
