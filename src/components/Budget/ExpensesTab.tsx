"use client"

import React, { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Receipt,
  Trash2,
  Edit2,
  Calendar,
  Users,
  Filter,
  ArrowRightLeft,
} from "lucide-react"
import { BudgetCategory, BudgetExpense, BudgetParticipant } from "@/types"
import { formatCurrency, isSettlementExpense } from "@/lib/budgetUtils"
import { deleteBudgetExpense } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import CategoryIcon from "./CategoryIcon"

interface ExpensesTabProps {
  budgetId: string
  currency: string
  expenses: BudgetExpense[]
  categories: BudgetCategory[]
  participants: BudgetParticipant[]
  onOpenExpenseModal: (expense?: BudgetExpense | null) => void
}

export default function ExpensesTab({
  budgetId,
  currency,
  expenses,
  categories,
  participants,
  onOpenExpenseModal,
}: ExpensesTabProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter expenses by search term and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.payer?.name && exp.payer.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        (selectedCategoryFilter === "uncategorized" && !exp.categoryId) ||
        exp.categoryId === selectedCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [expenses, searchTerm, selectedCategoryFilter])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Möchtest du die Ausgabe "${title}" wirklich löschen?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteBudgetExpense(id, budgetId)
      router.refresh()
    } catch (err) {
      console.error("Fehler beim Löschen der Ausgabe:", err)
      alert("Fehler beim Löschen.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ausgaben durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="uncategorized">Ohne Kategorie</option>
            </select>
          </div>
        </div>

        {/* Add Expense Button */}
        <button
          onClick={() => onOpenExpenseModal(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 transition-all cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ausgabe erfassen</span>
        </button>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
            {searchTerm || selectedCategoryFilter !== "all"
              ? "Keine passenden Ausgaben gefunden"
              : "Noch keine Ausgaben erfasst"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchTerm || selectedCategoryFilter !== "all"
              ? "Passe deine Filter an oder suche nach einem anderen Begriff."
              : "Klicke auf 'Ausgabe erfassen', um Belege, Einkäufe oder Buchungen festzuhalten."}
          </p>
          {!searchTerm && selectedCategoryFilter === "all" && (
            <button
              onClick={() => onOpenExpenseModal(null)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Erste Ausgabe anlegen</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredExpenses.map((exp) => {
            const cat = categories.find((c) => c.id === exp.categoryId)
            const isSettlement = isSettlementExpense(exp, categories)

            return (
              <div
                key={exp.id}
                className="group relative bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Category Icon, Title, Date & Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Category Badge Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5"
                    style={{ backgroundColor: cat?.color || (isSettlement ? "#06b6d4" : "#64748b") }}
                  >
                    <CategoryIcon name={cat?.icon || (isSettlement ? "arrow-right-left" : "tag")} className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 truncate">
                        {exp.title}
                      </span>
                      {cat && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color || "#3b82f6",
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                      {isSettlement && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
                          Ausgleich
                        </span>
                      )}
                    </div>

                    {/* Metadata Subtitle */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {exp.date}
                      </span>

                      {/* Payer info */}
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-400 dark:text-slate-500">Bezahlt von:</span>
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: exp.payer?.color || "#3b82f6" }}
                        />
                        <strong className="text-slate-700 dark:text-slate-300">
                          {exp.payer?.name || "Unbekannt"}
                        </strong>
                      </span>

                      {/* Splits preview / Recipient info */}
                      {isSettlement && exp.splits?.length === 1 ? (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                          <span>an:</span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {exp.splits[0].participant?.name || "Empfänger"}
                          </strong>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                          <Users className="w-3 h-3" />
                          {exp.splits?.length || 0} Beteiligte
                        </span>
                      )}
                    </div>

                    {/* Notes if any */}
                    {exp.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5 line-clamp-1">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(exp.amount, currency)}
                    </span>
                    {isSettlement ? (
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                        Nicht in Gesamtsumme
                      </span>
                    ) : exp.splits && exp.splits.length > 0 ? (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Ø {(exp.amount / exp.splits.length).toFixed(2)} {currency} / P.
                      </span>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenExpenseModal(exp)}
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Ausgabe bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.title)}
                      disabled={deletingId === exp.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Ausgabe löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
