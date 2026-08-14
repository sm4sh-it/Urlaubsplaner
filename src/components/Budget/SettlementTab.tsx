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
} from "lucide-react"
import { BudgetExpense, BudgetParticipant } from "@/types"
import {
  formatCurrency,
  calculateParticipantBalances,
  calculateSmartSettlements,
} from "@/lib/budgetUtils"

interface SettlementTabProps {
  budgetName: string
  currency: string
  participants: BudgetParticipant[]
  expenses: BudgetExpense[]
}

export default function SettlementTab({
  budgetName,
  currency,
  participants,
  expenses,
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
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  )

  const handleCopySummary = () => {
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

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner: Smart Settlement Actions */}
      <div className="bg-gradient-to-r from-brand-600/10 via-sky-500/10 to-indigo-500/10 border border-brand-500/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-[#161f28] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">In Zwischenablage kopiert!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-brand-500" />
              <span>Abrechnung kopieren (WhatsApp)</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Settlements Section */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Coins className="w-4 h-4 text-brand-500" />
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
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 shadow-xs"
              >
                {/* Debtor (From) */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: s.from.color || "#3b82f6" }}
                  >
                    {s.from.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">
                    {s.from.name}
                  </span>
                </div>

                {/* Amount Arrow */}
                <div className="flex flex-col items-center px-3 shrink-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {formatCurrency(s.amount, currency)}
                  </span>
                  <div className="flex items-center text-slate-400">
                    <ArrowRight className="w-4 h-4 text-brand-500" />
                  </div>
                </div>

                {/* Creditor (To) */}
                <div className="flex items-center gap-2.5 min-w-0 justify-end">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate text-right">
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
            ))}
          </div>
        )}
      </div>

      {/* Individual Balances Cards */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
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
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-3"
              >
                {/* Person Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: b.participant.color || "#3b82f6" }}
                    >
                      {b.participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">
                      {b.participant.name}
                    </span>
                  </div>

                  {/* Net Balance Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      isCreditor
                        ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : isDebtor
                        ? "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isCreditor ? "+" : ""}
                    {formatCurrency(b.netBalance, currency)}
                  </span>
                </div>

                {/* Sub details: Paid vs Share */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Ausgelegt</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(b.totalPaid, currency)}
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Eigenanteil</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
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
