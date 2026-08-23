"use client"

import React, { useMemo, useState } from "react"
import {
  Scale,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Coins,
  Share2,
  ArrowRightLeft,
} from "lucide-react"
import { BudgetCategory, BudgetExpense, BudgetParticipant, DebtSettlement } from "@/types"
import {
  formatCurrency,
  calculateParticipantBalances,
  calculateSmartSettlements,
  calculateTotalExpenses,
  copyToClipboard,
} from "@/lib/budgetUtils"
import { useStore } from "@/store/useStore"

interface SettlementTabProps {
  budgetName: string
  currency: string
  participants: BudgetParticipant[]
  expenses: BudgetExpense[]
  categories?: BudgetCategory[]
  onSettleDebt?: (settlement: DebtSettlement) => void
}

export default function SettlementTab({
  budgetName,
  currency,
  participants,
  expenses,
  categories,
  onSettleDebt,
}: SettlementTabProps) {
  const [copied, setCopied] = useState(false)

  const balances = useMemo(
    () => calculateParticipantBalances(participants, expenses),
    [participants, expenses]
  )

  const settlements = useMemo(
    () => calculateSmartSettlements(participants, expenses),
    [participants, expenses]
  )

  const totalSpent = useMemo(
    () => calculateTotalExpenses(expenses, categories),
    [expenses, categories]
  )

  const handleCopySummary = async () => {
    let text = `📊 *Kostenabrechnung: ${budgetName}*\n`
    text += `Gesamtausgaben: ${formatCurrency(totalSpent, currency)}\n\n`
    text += `*Saldenübersicht:*\n`
    balances.forEach((b) => {
      const sign = b.netBalance > 0 ? "+" : ""
      text += `• ${b.participant.name}: ${sign}${formatCurrency(b.netBalance, currency)} (Bezahlt: ${formatCurrency(b.totalPaid, currency)}, Anteil: ${formatCurrency(b.totalShare, currency)})\n`
    })

    text += `\n*Ausgleichszahlungen:*\n`
    if (settlements.length === 0) {
      text += `Alle Ausgaben sind bereits perfekt ausgeglichen! 🎉\n`
    } else {
      settlements.forEach((s) => {
        text += `👉 ${s.from.name} überweist ${formatCurrency(s.amount, currency)} an ${s.to.name}\n`
      })
    }

    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      useStore.getState().addToast({
        type: "info",
        title: "In Zwischenablage kopiert",
        description: "Die Abrechnungsübersicht wurde in die Zwischenablage kopiert.",
      })
      setTimeout(() => setCopied(false), 2500)
    } else {
      useStore.getState().addToast({
        type: "error",
        title: "Kopieren fehlgeschlagen",
        description: "Der Zugriff auf die Zwischenablage wurde vom Browser blockiert.",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Banner: Smart Settlement Actions */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Smarter Saldenausgleich
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automatische Schulden-Minimierung: {settlements.length} Transaktion
              {settlements.length === 1 ? "" : "en"} erforderlich für vollständigen Ausgleich.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          className="btn-glass inline-flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">In Zwischenablage kopiert!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-brand-500" />
              <span>Abrechnung kopieren</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Settlements Section */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Wer schuldet wem wie viel?
        </h3>

        {settlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              Perfekt ausgeglichen!
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              Es sind derzeit keine offenen Ausgleichszahlungen erforderlich.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settlements.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 shadow-xs gap-3"
              >
                <div className="flex items-center justify-between flex-1 min-w-0">
                  {/* Debtor (From) */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: s.from.color || "#3b82f6" }}
                    >
                      {s.from.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {s.from.name}
                    </span>
                  </div>

                  {/* Amount Arrow */}
                  <div className="flex flex-col items-center px-3 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">
                      {formatCurrency(s.amount, currency)}
                    </span>
                    <div className="flex items-center text-slate-400">
                      <ArrowRight className="w-4 h-4 text-brand-500" />
                    </div>
                  </div>

                  {/* Creditor (To) */}
                  <div className="flex items-center gap-2.5 min-w-0 justify-end">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate text-right">
                      {s.to.name}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: s.to.color || "#3b82f6" }}
                    >
                      {s.to.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {onSettleDebt && (
                  <button
                    onClick={() => onSettleDebt(s)}
                    className="btn-glass inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-600 dark:text-cyan-400 shrink-0"
                    title="Diese Ausgleichszahlung direkt als Beleg erfassen"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Ausgleichen</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Balances Cards */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Individuelle Saldenübersicht ({balances.length} Personen)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => {
            const isCreditor = b.netBalance > 0.005
            const isDebtor = b.netBalance < -0.005

            return (
              <div
                key={b.participant.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 flex flex-col justify-between gap-3"
              >
                {/* Person Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: b.participant.color || "#3b82f6" }}
                    >
                      {b.participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {b.participant.name}
                    </span>
                  </div>

                  {/* Net Balance Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono shrink-0 ${
                      isCreditor
                        ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : isDebtor
                        ? "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {isCreditor ? "+" : ""}
                    {formatCurrency(b.netBalance, currency)}
                  </span>
                </div>

                {/* Sub details: Paid vs Share */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Ausgelegt</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                      {formatCurrency(b.totalPaid, currency)}
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Eigenanteil</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                      {formatCurrency(b.totalShare, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
