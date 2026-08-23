"use client"

import React, { useMemo, useState } from "react"
import {
  PieChart,
  Tag,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  Receipt,
  Layers,
  RotateCcw,
} from "lucide-react"
import { BudgetCategory, BudgetExpense } from "@/types"
import {
  formatCurrency,
  calculateCategoryBreakdown,
  calculateDailyAverage,
  calculateTotalExpenses,
  isSettlementExpense,
  DEFAULT_BUDGET_CATEGORIES,
} from "@/lib/budgetUtils"
import { deleteBudgetCategory, restoreDefaultBudgetCategories } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import CategoryIcon from "./CategoryIcon"
import { useStore } from "@/store/useStore"

interface AnalyticsTabProps {
  budgetId: string
  currency: string
  expenses: BudgetExpense[]
  categories: BudgetCategory[]
  startDate?: string | null
  endDate?: string | null
  onOpenCategoryModal: () => void
}

export default function AnalyticsTab({
  budgetId,
  currency,
  expenses,
  categories,
  startDate,
  endDate,
  onOpenCategoryModal,
}: AnalyticsTabProps) {
  const router = useRouter()
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  const existingCatNames = useMemo(
    () => new Set(categories.map((c) => c.name.trim().toLowerCase())),
    [categories]
  )
  const missingDefaultsCount = useMemo(
    () =>
      DEFAULT_BUDGET_CATEGORIES.filter(
        (cat) => !existingCatNames.has(cat.name.trim().toLowerCase())
      ).length,
    [existingCatNames]
  )

  const handleRestoreDefaults = async () => {
    setIsRestoring(true)
    try {
      const res = await restoreDefaultBudgetCategories(budgetId)
      if (res.success) {
        useStore.getState().addToast({
          type: "success",
          title: "Kategorien wiederhergestellt",
          description: "Fehlende Standard-Kategorien wurden hinzugefügt.",
        })
        router.refresh()
      } else {
        useStore.getState().addToast({
          type: "error",
          title: "Fehler beim Wiederherstellen",
          description: res.error || "Fehler beim Wiederherstellen der Kategorien.",
        })
      }
    } catch (err: any) {
      console.error("Fehler beim Wiederherstellen:", err)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler",
        description: err.message || "Fehler beim Wiederherstellen der Kategorien.",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const breakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, categories),
    [expenses, categories]
  )

  const totalSpent = useMemo(() => calculateTotalExpenses(expenses, categories), [expenses, categories])

  const dailyAverage = useMemo(
    () => calculateDailyAverage(expenses, startDate, endDate, categories),
    [expenses, startDate, endDate, categories]
  )

  // Find biggest single travel expense (excluding debt settlement)
  const topExpense = useMemo(() => {
    const travelExpenses = expenses.filter((e) => !isSettlementExpense(e, categories))
    if (travelExpenses.length === 0) return null
    return [...travelExpenses].sort((a, b) => b.amount - a.amount)[0]
  }, [expenses, categories])

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Möchtest du die Kategorie "${catName}" wirklich löschen?`)) {
      return
    }

    setDeletingCatId(catId)
    try {
      await deleteBudgetCategory(catId, budgetId)
      useStore.getState().addToast({
        type: "info",
        title: "Kategorie gelöscht",
        description: `Kategorie "${catName}" wurde entfernt.`,
      })
      router.refresh()
    } catch (err: any) {
      console.error("Fehler beim Löschen der Kategorie:", err)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Löschen",
        description: err.message || "Die Kategorie konnte nicht gelöscht werden.",
      })
    } finally {
      setDeletingCatId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Average */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            Ø Kosten pro Reisetag
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {formatCurrency(dailyAverage.avgPerDay, currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Berechnet über {dailyAverage.daysCount} Tag{dailyAverage.daysCount === 1 ? "" : "e"}
          </span>
        </div>

        {/* Top Single Expense */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Größte Einzelausgabe
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {topExpense ? formatCurrency(topExpense.amount, currency) : "-"}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
            {topExpense ? `"${topExpense.title}"` : "Keine Ausgaben vorhanden"}
          </span>
        </div>

        {/* Categories Count */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Aktive Kategorien
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {breakdown.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1.5">von {categories.length}</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            mit erfassten Buchungen
          </span>
        </div>
      </div>

      {/* Category Breakdown & Progress Bars */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Ausgaben nach Kategorie
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Prozentuale Verteilung der Gesamtausgaben ({formatCurrency(totalSpent, currency)})
            </p>
          </div>
          <button
            onClick={onOpenCategoryModal}
            className="btn-glass inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200"
          >
            <Plus className="w-3.5 h-3.5 text-brand-500" />
            <span>Kategorie anlegen</span>
          </button>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
            Noch keine kategorisierten Ausgaben vorhanden.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/10">
              {breakdown.map((item) => (
                <div
                  key={item.id}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                  className="h-full transition-all duration-500"
                  title={`${item.name}: ${item.percent.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* List of Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {breakdown.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {item.count} Posten ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-sm text-slate-800 dark:text-slate-100">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Management List */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Alle verfügbaren Kategorien ({categories.length})
          </h3>

          {missingDefaultsCount > 0 && (
            <button
              onClick={handleRestoreDefaults}
              disabled={isRestoring}
              className="btn-glass inline-flex items-center gap-1.5 font-semibold text-xs text-brand-600 dark:text-brand-400 disabled:opacity-50"
              title="Fehlende Standard-Kategorien (z. B. Ausgleich) wiederherstellen"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-brand-500 ${isRestoring ? "animate-spin" : ""}`} />
              <span>Standard wiederherstellen ({missingDefaultsCount})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: cat.color || "#3b82f6" }}
              >
                <CategoryIcon name={cat.icon} className="w-3 h-3" />
              </div>
              <span>{cat.name}</span>

              {/* Custom categories can be deleted */}
              {cat.budgetId && (
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  disabled={deletingCatId === cat.id}
                  className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
                  title="Kategorie löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
