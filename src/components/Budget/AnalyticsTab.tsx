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
} from "lucide-react"
import { BudgetCategory, BudgetExpense } from "@/types"
import {
  formatCurrency,
  calculateCategoryBreakdown,
  calculateDailyAverage,
  calculateTotalExpenses,
} from "@/lib/budgetUtils"
import { deleteBudgetCategory } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"

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

  const breakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, categories),
    [expenses, categories]
  )

  const totalSpent = useMemo(() => calculateTotalExpenses(expenses), [expenses])

  const dailyAverage = useMemo(
    () => calculateDailyAverage(expenses, startDate, endDate),
    [expenses, startDate, endDate]
  )

  // Find biggest single expense
  const topExpense = useMemo(() => {
    if (expenses.length === 0) return null
    return [...expenses].sort((a, b) => b.amount - a.amount)[0]
  }, [expenses])

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Möchtest du die Kategorie "${catName}" wirklich löschen?`)) {
      return
    }

    setDeletingCatId(catId)
    try {
      await deleteBudgetCategory(catId, budgetId)
      router.refresh()
    } catch (err) {
      console.error("Fehler beim Löschen der Kategorie:", err)
      alert("Fehler beim Löschen.")
    } finally {
      setDeletingCatId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Average */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            Ø Kosten pro Reisetag
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {formatCurrency(dailyAverage.avgPerDay, currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Berechnet über {dailyAverage.daysCount} Tag{dailyAverage.daysCount === 1 ? "" : "e"}
          </span>
        </div>

        {/* Top Single Expense */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Größte Einzelausgabe
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {topExpense ? formatCurrency(topExpense.amount, currency) : "-"}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium truncate">
            {topExpense ? `"${topExpense.title}"` : "Keine Ausgaben vorhanden"}
          </span>
        </div>

        {/* Categories Count */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Aktive Kategorien
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {breakdown.length}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1.5">von {categories.length}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            mit erfassten Buchungen
          </span>
        </div>
      </div>

      {/* Category Breakdown & Progress Bars */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Ausgaben nach Kategorie
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prozentuale Verteilung der Gesamtausgaben ({formatCurrency(totalSpent, currency)})
            </p>
          </div>
          <button
            onClick={onOpenCategoryModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand-500" />
            <span>Kategorie anlegen</span>
          </button>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Noch keine kategorisierten Ausgaben vorhanden.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
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
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.count} Posten ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-slate-800 dark:text-slate-100">
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
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Alle verfügbaren Kategorien ({categories.length})
          </h3>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color || "#3b82f6" }}
              />
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
