"use client"

import React, { useMemo, useState } from "react"
import { Users, UserPlus, Trash2, Wallet, DollarSign, UserCheck } from "lucide-react"
import { BudgetExpense, BudgetParticipant } from "@/types"
import { formatCurrency, calculateParticipantBalances } from "@/lib/budgetUtils"
import { deleteBudgetParticipant } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"

interface ParticipantsTabProps {
  budgetId: string
  currency: string
  participants: BudgetParticipant[]
  expenses: BudgetExpense[]
  onOpenAddParticipant: () => void
}

export default function ParticipantsTab({
  budgetId,
  currency,
  participants,
  expenses,
  onOpenAddParticipant,
}: ParticipantsTabProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const balances = useMemo(
    () => calculateParticipantBalances(participants, expenses),
    [participants, expenses]
  )

  const handleDelete = async (participantId: string, name: string) => {
    // Check if participant has expenses or splits
    const hasPaid = expenses.some((e) => e.payerId === participantId)
    const hasSplits = expenses.some((e) =>
      e.splits?.some((s) => s.participantId === participantId)
    )

    let confirmMsg = `Möchtest du "${name}" wirklich aus diesem Budget entfernen?`
    if (hasPaid || hasSplits) {
      confirmMsg = `Achtung: "${name}" ist bereits an erfassten Ausgaben beteiligt. Wenn du die Person entfernst, werden auch deren Ausgaben und Anteile gelöscht. Fortfahren?`
    }

    if (!confirm(confirmMsg)) return

    setDeletingId(participantId)
    try {
      await deleteBudgetParticipant(participantId, budgetId)
      useStore.getState().addToast({
        type: "info",
        title: "Teilnehmer entfernt",
        description: `"${name}" wurde aus dem Budget entfernt.`,
      })
      router.refresh()
    } catch (err: any) {
      console.error("Fehler beim Löschen des Teilnehmers:", err)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Entfernen",
        description: err.message || "Teilnehmer konnte nicht entfernt werden.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Reiseteilnehmer ({participants.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verwalte die beteiligten Profile und externen Gäste für dieses Reise-Budget.
          </p>
        </div>

        <button
          onClick={onOpenAddParticipant}
          className="btn-glass inline-flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 shrink-0"
        >
          <UserPlus className="w-4 h-4 text-brand-500 shrink-0" />
          <span>Teilnehmer hinzufügen</span>
        </button>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((b) => {
          const isGuest = !b.participant.profileId
          const expensesCount = expenses.filter((e) => e.payerId === b.participant.id).length

          return (
            <div
              key={b.participant.id}
              className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: b.participant.color || "#3b82f6" }}
                  >
                    {b.participant.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                        {b.participant.name}
                      </span>
                      {isGuest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          Gast
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {expensesCount} Beleg{expensesCount === 1 ? "" : "e"} bezahlt
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                {participants.length > 1 && (
                  <button
                    onClick={() => handleDelete(b.participant.id, b.participant.name)}
                    disabled={deletingId === b.participant.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Teilnehmer entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Ausgelegt</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">
                    {formatCurrency(b.totalPaid, currency)}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Eigenanteil</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">
                    {formatCurrency(b.totalShare, currency)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
