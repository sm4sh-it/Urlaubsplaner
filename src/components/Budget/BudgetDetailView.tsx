"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Receipt,
  PieChart,
  Scale,
  Users,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  Plane,
  AlertCircle,
  Check,
} from "lucide-react"
import { BudgetExpense, BudgetParticipant, Profile, Trip, TripBudget } from "@/types"
import {
  formatCurrency,
  calculateTotalExpenses,
  calculateDailyAverage,
} from "@/lib/budgetUtils"
import { deleteTripBudget, syncTripCostWithBudget } from "@/app/actions/budgetActions"
import ExpensesTab from "./ExpensesTab"
import { useStore } from "@/store/useStore"
import AnalyticsTab from "./AnalyticsTab"
import SettlementTab from "./SettlementTab"
import ParticipantsTab from "./ParticipantsTab"
import ExpenseModal from "./ExpenseModal"
import AddParticipantModal from "./AddParticipantModal"
import CategoryModal from "./CategoryModal"
import CreateBudgetModal from "./CreateBudgetModal"

interface BudgetDetailViewProps {
  budget: TripBudget
  allProfiles: Profile[]
  allTrips: Trip[]
}

type TabType = "expenses" | "analytics" | "settlement" | "participants"

export default function BudgetDetailView({
  budget,
  allProfiles,
  allTrips,
}: BudgetDetailViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("expenses")

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<BudgetExpense | null>(null)
  const [initialExpenseData, setInitialExpenseData] = useState<{
    title?: string
    amount?: number | string
    categoryId?: string
    payerId?: string
    splitParticipantIds?: string[]
    notes?: string
  } | null>(null)
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false)

  // Trip Sync state
  const [isSyncingTrip, setIsSyncingTrip] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Calculate Metrics
  const totalSpent = useMemo(
    () => calculateTotalExpenses(budget.expenses, budget.categories),
    [budget.expenses, budget.categories]
  )

  const dailyAvg = useMemo(
    () => calculateDailyAverage(budget.expenses, budget.startDate, budget.endDate, budget.categories),
    [budget.expenses, budget.startDate, budget.endDate, budget.categories]
  )

  const perPersonAvg = useMemo(() => {
    if (budget.participants.length === 0) return 0
    return totalSpent / budget.participants.length
  }, [totalSpent, budget.participants.length])

  const hasLimit = budget.totalBudget && budget.totalBudget > 0
  const percentUsed = hasLimit
    ? Math.min(100, (totalSpent / budget.totalBudget!) * 100)
    : 0
  const isOverBudget = hasLimit && totalSpent > budget.totalBudget!

  // Trip Sync Handler
  const handleSyncTripCost = async () => {
    setIsSyncingTrip(true)
    setSyncFeedback(null)
    try {
      const res = await syncTripCostWithBudget(budget.id)
      if (res.success) {
        const msg = res.message || "Kosten erfolgreich synchronisiert!"
        setSyncFeedback(msg)
        useStore.getState().addToast({
          type: "success",
          title: "Reisekosten synchronisiert",
          description: msg,
        })
        setTimeout(() => setSyncFeedback(null), 4000)
      } else {
        const errMsg = res.error || "Fehler bei der Synchronisation."
        setSyncFeedback(errMsg)
        useStore.getState().addToast({
          type: "error",
          title: "Fehler bei der Synchronisation",
          description: errMsg,
        })
        setTimeout(() => setSyncFeedback(null), 4000)
      }
    } catch (err: any) {
      const errMsg = err.message || "Fehler beim Synchronisieren."
      setSyncFeedback(errMsg)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler bei der Synchronisation",
        description: errMsg,
      })
      setTimeout(() => setSyncFeedback(null), 4000)
    } finally {
      setIsSyncingTrip(false)
    }
  }

  const handleDeleteBudget = async () => {
    if (!confirm(`Möchtest du das Reise-Budget "${budget.name}" wirklich löschen?`)) {
      return
    }

    try {
      await deleteTripBudget(budget.id)
      useStore.getState().addToast({
        type: "info",
        title: "Budget gelöscht",
        description: `Reise-Budget "${budget.name}" wurde entfernt.`,
      })
      router.push("/budget")
    } catch (err: any) {
      console.error("Fehler beim Löschen:", err)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Löschen",
        description: err.message || "Das Reise-Budget konnte nicht gelöscht werden.",
      })
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6 md:gap-8 animate-in fade-in duration-300">
      {/* Back button & Title Bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <Link
            href="/budget"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Budget-Übersicht</span>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditBudgetModalOpen(true)}
              className="btn-glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Bearbeiten</span>
            </button>
            <button
              onClick={handleDeleteBudget}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              title="Budget löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Dates */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {budget.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {budget.startDate && (
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {budget.startDate} {budget.endDate ? `bis ${budget.endDate}` : ""}
                </span>
              )}
              {budget.trip && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
                  <Plane className="w-3.5 h-3.5 text-brand-500" />
                  Verknüpft: {budget.trip.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick KPI Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Gesamtausgaben
          </span>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalSpent, budget.currency)}
            </span>
          </div>
          {hasLimit ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                <span>Limit: {formatCurrency(budget.totalBudget, budget.currency)}</span>
                <span className={isOverBudget ? "text-rose-500 font-bold" : ""}>
                  {Math.round((totalSpent / budget.totalBudget!) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
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
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">Kein Limit festgelegt</span>
          )}
        </div>

        {/* Daily Average */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Ø Kosten pro Tag
          </span>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(dailyAvg.avgPerDay, budget.currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Über {dailyAvg.daysCount} Reisetag{dailyAvg.daysCount === 1 ? "" : "e"}
          </span>
        </div>

        {/* Per Person Average */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Ø Kosten pro Person
          </span>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(perPersonAvg, budget.currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Aufgeteilt auf {budget.participants.length} Teilnehmer
          </span>
        </div>

        {/* Trip Sync or Participants Count */}
        <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reise-Synchronisation
          </span>
          
          {budget.trip ? (
            <div className="my-1 flex flex-col gap-2">
              <button
                onClick={handleSyncTripCost}
                disabled={isSyncingTrip}
                className="btn-glass inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50"
                title="Aktualisiert das Feld 'cost' der verknüpften Reise im Kalender"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${isSyncingTrip ? "animate-spin" : ""}`} />
                <span>Kosten in Reise übernehmen</span>
              </button>

              {syncFeedback && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" />
                  {syncFeedback}
                </span>
              )}
            </div>
          ) : (
            <div className="my-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Eigenständiges Budget
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Nicht mit einer Kalender-Reise verknüpft.
              </p>
            </div>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {budget.expenses.length} Ausgaben gebucht
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2 sm:gap-4 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "expenses"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Ausgaben</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            {budget.expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Kategorien &amp; Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("settlement")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "settlement"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Abrechnung &amp; Salden</span>
        </button>

        <button
          onClick={() => setActiveTab("participants")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "participants"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teilnehmer</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            {budget.participants.length}
          </span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "expenses" && (
          <ExpensesTab
            budgetId={budget.id}
            currency={budget.currency}
            expenses={budget.expenses}
            categories={budget.categories}
            participants={budget.participants}
            onOpenExpenseModal={(exp) => {
              setExpenseToEdit(exp || null)
              setInitialExpenseData(null)
              setIsExpenseModalOpen(true)
            }}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            budgetId={budget.id}
            currency={budget.currency}
            expenses={budget.expenses}
            categories={budget.categories}
            startDate={budget.startDate}
            endDate={budget.endDate}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          />
        )}

        {activeTab === "settlement" && (
          <SettlementTab
            budgetName={budget.name}
            currency={budget.currency}
            participants={budget.participants}
            expenses={budget.expenses}
            categories={budget.categories}
            onSettleDebt={(settlement) => {
              const ausgleichCat = budget.categories.find(
                (c) => c.name.trim().toLowerCase() === "ausgleich"
              )
              setExpenseToEdit(null)
              setInitialExpenseData({
                title: `Ausgleich: ${settlement.from.name} an ${settlement.to.name}`,
                amount: settlement.amount,
                categoryId: ausgleichCat?.id || budget.categories[0]?.id || "",
                payerId: settlement.from.id,
                splitParticipantIds: [settlement.to.id],
                notes: "Ausgleichszahlung für Saldenausgleich",
              })
              setIsExpenseModalOpen(true)
            }}
          />
        )}

        {activeTab === "participants" && (
          <ParticipantsTab
            budgetId={budget.id}
            currency={budget.currency}
            participants={budget.participants}
            expenses={budget.expenses}
            onOpenAddParticipant={() => setIsAddParticipantModalOpen(true)}
          />
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false)
          setExpenseToEdit(null)
          setInitialExpenseData(null)
        }}
        budgetId={budget.id}
        currency={budget.currency}
        participants={budget.participants}
        categories={budget.categories}
        expenseToEdit={expenseToEdit}
        initialExpenseData={initialExpenseData}
        defaultDate={budget.startDate || undefined}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Add Participant Modal */}
      <AddParticipantModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        budgetId={budget.id}
        existingParticipants={budget.participants}
        allProfiles={allProfiles}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        budgetId={budget.id}
        existingCategories={budget.categories}
      />

      {/* Edit Budget Meta Modal */}
      <CreateBudgetModal
        isOpen={isEditBudgetModalOpen}
        onClose={() => setIsEditBudgetModalOpen(false)}
        profiles={allProfiles}
        trips={allTrips}
        selectedYear={new Date().getFullYear()}
        budgetToEdit={budget}
      />
    </div>
  )
}
