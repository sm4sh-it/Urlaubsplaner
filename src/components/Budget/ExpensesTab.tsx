"use client"

import React, { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Receipt,
  Edit2,
  Trash2,
  Calendar,
  User,
  Tag,
  AlignLeft,
  Users,
} from "lucide-react"
import { BudgetCategory, BudgetExpense, BudgetParticipant } from "@/types"
import { formatCurrency } from "@/lib/budgetUtils"
import { deleteBudgetExpense } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [selectedPayerId, setSelectedPayerId] = useState<string>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Map categories for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, BudgetCategory>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Search
      const matchSearch =
        searchTerm.trim() === "" ||
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.payer?.name.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      // Category
      if (selectedCategoryId !== "all" && exp.categoryId !== selectedCategoryId) {
        return false
      }

      // Payer
      if (selectedPayerId !== "all" && exp.payerId !== selectedPayerId) {
        return false
      }

      return true
    })
  }, [expenses, searchTerm, selectedCategoryId, selectedPayerId])

  const handleDelete = async (expenseId: string, title: string) => {
    if (!confirm(`Möchtest du die Ausgabe "${title}" wirklich löschen?`)) {
      return
    }

    setDeletingId(expenseId)
    try {
      await deleteBudgetExpense(expenseId, budgetId)
      router.refresh()
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
      alert("Fehler beim Löschen der Ausgabe.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar: Search, Filters & Action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ausgabe oder Notiz suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border-none bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Payer Filter */}
          <select
            value={selectedPayerId}
            onChange={(e) => setSelectedPayerId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Alle Zahler</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Add Expense Button */}
          <button
            onClick={() => onOpenExpenseModal(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#161f28]/70 hover:bg-[#fafafa] dark:hover:bg-[#1e2a36]/90 border border-slate-300 dark:border-slate-700/80 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-500/10 active:translate-y-0 active:scale-[0.98] transition-all duration-300 backdrop-blur-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Ausgabe erfassen</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-center p-6">
          <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Keine Ausgaben gefunden
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
            {searchTerm || selectedCategoryId !== "all" || selectedPayerId !== "all"
              ? "Keine passenden Ausgaben für deine Filterkriterien gefunden."
              : "Erfasse deinen ersten Reisebeleg, um gemeinsame Kosten aufzuteilen."}
          </p>
          <button
            onClick={() => onOpenExpenseModal(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Erste Ausgabe erfassen</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredExpenses.map((exp) => {
            const cat = exp.categoryId ? categoryMap.get(exp.categoryId) : null

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
                    style={{ backgroundColor: cat?.color || "#64748b" }}
                  >
                    <Tag className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">
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
                    </div>

                    {/* Metadata Subtitle */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {exp.date}
                      </span>

                      {/* Payer info */}
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-400">Bezahlt von:</span>
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: exp.payer?.color || "#3b82f6" }}
                        />
                        <strong className="text-slate-700 dark:text-slate-200">
                          {exp.payer?.name || "Unbekannt"}
                        </strong>
                      </span>

                      {/* Splits preview */}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3 h-3" />
                        {exp.splits?.length || 0} Beteiligte
                      </span>
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
                    <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                      {formatCurrency(exp.amount, currency)}
                    </span>
                    {exp.splits && exp.splits.length > 0 && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Ø {(exp.amount / exp.splits.length).toFixed(2)} {currency} / P.
                      </span>
                    )}
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
