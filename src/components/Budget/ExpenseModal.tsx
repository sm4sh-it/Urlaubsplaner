"use client"

import React, { useState, useEffect } from "react"
import { X, Plus, DollarSign, Calendar, Tag, User, Users, AlignLeft, Check } from "lucide-react"
import { BudgetCategory, BudgetExpense, BudgetParticipant } from "@/types"
import { formatCurrency } from "@/lib/budgetUtils"
import { addBudgetExpense, updateBudgetExpense } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string
  currency: string
  participants: BudgetParticipant[]
  categories: BudgetCategory[]
  expenseToEdit?: BudgetExpense | null
  defaultDate?: string
  onOpenCategoryModal?: () => void
}

export default function ExpenseModal({
  isOpen,
  onClose,
  budgetId,
  currency,
  participants,
  categories,
  expenseToEdit,
  defaultDate,
  onOpenCategoryModal,
}: ExpenseModalProps) {
  const router = useRouter()
  const todayStr = new Date().toISOString().split("T")[0]

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [date, setDate] = useState(defaultDate || todayStr)
  const [notes, setNotes] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [payerId, setPayerId] = useState<string>("")

  // Split mode: "equal" | "custom"
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal")
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title)
      setAmount(expenseToEdit.amount.toString())
      setDate(expenseToEdit.date || todayStr)
      setNotes(expenseToEdit.notes || "")
      setCategoryId(expenseToEdit.categoryId || "")
      setPayerId(expenseToEdit.payerId || (participants[0]?.id ?? ""))

      const splitParticipantIds = expenseToEdit.splits.map((s) => s.participantId)
      setSelectedParticipantIds(splitParticipantIds)

      // Check if splits were equal or custom
      const total = expenseToEdit.amount
      const count = expenseToEdit.splits.length
      const expectedShare = count > 0 ? total / count : 0
      const isCustom = expenseToEdit.splits.some(
        (s) => Math.abs(s.amount - expectedShare) > 0.02
      )

      if (isCustom) {
        setSplitMode("custom")
        const customMap: Record<string, string> = {}
        expenseToEdit.splits.forEach((s) => {
          customMap[s.participantId] = s.amount.toString()
        })
        setCustomSplits(customMap)
      } else {
        setSplitMode("equal")
        setCustomSplits({})
      }
    } else {
      setTitle("")
      setAmount("")
      setDate(defaultDate || todayStr)
      setNotes("")
      setCategoryId(categories[0]?.id || "")
      setPayerId(participants[0]?.id || "")
      setSplitMode("equal")
      // By default, select all participants
      setSelectedParticipantIds(participants.map((p) => p.id))
      setCustomSplits({})
      setError(null)
    }
  }, [isOpen, expenseToEdit, participants, categories, defaultDate])

  const parsedAmount = parseFloat(amount) || 0

  // Calculate equal split amounts
  const equalShare =
    selectedParticipantIds.length > 0
      ? Math.round((parsedAmount / selectedParticipantIds.length) * 100) / 100
      : 0

  // Calculate custom split sum
  const customSum = Object.values(customSplits).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  )
  const customDiff = Math.round((parsedAmount - customSum) * 100) / 100

  const handleToggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    )
  }

  const handleCustomSplitChange = (participantId: string, val: string) => {
    setCustomSplits((prev) => ({
      ...prev,
      [participantId]: val,
    }))
  }

  const handleSelectAll = () => {
    setSelectedParticipantIds(participants.map((p) => p.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Bitte gib einen Titel für die Ausgabe ein.")
      return
    }

    if (parsedAmount <= 0) {
      setError("Der Betrag muss größer als 0 sein.")
      return
    }

    if (!payerId) {
      setError("Bitte wähle aus, wer den Betrag bezahlt hat.")
      return
    }

    let finalSplits: { participantId: string; amount: number }[] = []

    if (splitMode === "equal") {
      if (selectedParticipantIds.length === 0) {
        setError("Bitte wähle mindestens einen beteiligten Teilnehmer aus.")
        return
      }

      // Calculate splits with cents rounding correction
      const baseShare = Math.floor((parsedAmount / selectedParticipantIds.length) * 100) / 100
      let remainder = Math.round((parsedAmount - baseShare * selectedParticipantIds.length) * 100)

      finalSplits = selectedParticipantIds.map((pId) => {
        let pShare = baseShare
        if (remainder > 0) {
          pShare += 0.01
          remainder -= 1
        }
        return {
          participantId: pId,
          amount: Math.round(pShare * 100) / 100,
        }
      })
    } else {
      // Custom mode validation
      if (Math.abs(customDiff) > 0.01) {
        setError(
          `Die Summe der Einzelbeträge (${customSum.toFixed(2)} ${currency}) stimmt nicht mit dem Gesamtbetrag (${parsedAmount.toFixed(2)} ${currency}) überein.`
        )
        return
      }

      finalSplits = Object.entries(customSplits)
        .map(([pId, val]) => ({
          participantId: pId,
          amount: parseFloat(val) || 0,
        }))
        .filter((s) => s.amount > 0)

      if (finalSplits.length === 0) {
        setError("Mindestens ein Teilnehmer muss einen Anteil größer als 0 erhalten.")
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (expenseToEdit) {
        const res = await updateBudgetExpense(expenseToEdit.id, budgetId, {
          title: title.trim(),
          amount: parsedAmount,
          date,
          notes: notes.trim() || null,
          categoryId: categoryId || null,
          payerId,
          splits: finalSplits,
        })
        if (!res.success) {
          setError(res.error || "Fehler beim Aktualisieren")
          setIsSubmitting(false)
          return
        }
      } else {
        const res = await addBudgetExpense(budgetId, {
          title: title.trim(),
          amount: parsedAmount,
          date,
          notes: notes.trim() || null,
          categoryId: categoryId || null,
          payerId,
          splits: finalSplits,
        })
        if (!res.success) {
          setError(res.error || "Fehler beim Erfassen")
          setIsSubmitting(false)
          return
        }
      }

      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Unerwarteter Fehler")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {expenseToEdit ? "Ausgabe bearbeiten" : "Neue Ausgabe erfassen"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar p-6 gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Beschreibung / Titel *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Abendessen, Mietwagen, Hotel"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Betrag ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-800 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Datum
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Kategorie
                </label>
                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    + Neu
                  </button>
                )}
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">-- Ohne Kategorie --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payer (Bezahlt von) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-brand-500" />
              Bezahlt von *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => {
                const isSelected = payerId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayerId(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-500/15 border-brand-500/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30"
                        : "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: p.color || "#3b82f6" }}
                    />
                    <span className="truncate">{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Split Mode Selector */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-500" />
                Aufteilung (Split) *
              </label>
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSplitMode("equal")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    splitMode === "equal"
                      ? "bg-white dark:bg-[#161f28] text-slate-800 dark:text-slate-100 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Gleichmäßig
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSplitMode("custom")
                    // Initialize custom splits if empty
                    if (Object.keys(customSplits).length === 0 && selectedParticipantIds.length > 0) {
                      const initialMap: Record<string, string> = {}
                      selectedParticipantIds.forEach((id) => {
                        initialMap[id] = equalShare.toString()
                      })
                      setCustomSplits(initialMap)
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    splitMode === "custom"
                      ? "bg-white dark:bg-[#161f28] text-slate-800 dark:text-slate-100 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Individuell
                </button>
              </div>
            </div>

            {/* Split Mode 1: Equal Split Checkboxes */}
            {splitMode === "equal" && (
              <div className="flex flex-col gap-2 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    {selectedParticipantIds.length} von {participants.length} Personen beteiligt
                  </span>
                  {selectedParticipantIds.length > 0 && parsedAmount > 0 && (
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      Ø {equalShare.toFixed(2)} {currency} / Person
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {participants.map((p) => {
                    const isChecked = selectedParticipantIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleParticipant(p.id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isChecked
                            ? "bg-white dark:bg-[#161f28] border-brand-500/40 text-slate-800 dark:text-slate-100 shadow-xs"
                            : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.color || "#3b82f6" }}
                          />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {isChecked && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Split Mode 2: Custom Amount Inputs */}
            {splitMode === "custom" && (
              <div className="flex flex-col gap-2.5 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Gesamt: {parsedAmount.toFixed(2)} {currency}
                  </span>
                  <span
                    className={`font-bold ${
                      Math.abs(customDiff) < 0.01
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {Math.abs(customDiff) < 0.01
                      ? "Ausgeglichen ✓"
                      : `Differenz: ${customDiff > 0 ? "+" : ""}${customDiff.toFixed(2)} ${currency}`}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {participants.map((p) => {
                    const currentVal = customSplits[p.id] || ""
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 p-1.5 bg-white dark:bg-[#161f28] border border-slate-200/80 dark:border-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: p.color || "#3b82f6" }}
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentVal}
                            onChange={(e) => handleCustomSplitChange(p.id, e.target.value)}
                            placeholder="0.00"
                            className="w-24 px-2 py-1 text-right text-xs font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          <span className="text-xs text-slate-400 font-medium">{currency}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Notizen / Details (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. Belegnummer, Link, Aufteilungsgrund..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#161f28]/70 hover:bg-[#fafafa] dark:hover:bg-[#1e2a36]/90 border border-slate-300 dark:border-slate-700/80 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-500/10 active:translate-y-0 active:scale-[0.98] transition-all duration-300 backdrop-blur-md cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-brand-500 shrink-0" />
              <span>
                {isSubmitting ? "Wird gespeichert..." : expenseToEdit ? "Ausgabe aktualisieren" : "Ausgabe erfassen"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
