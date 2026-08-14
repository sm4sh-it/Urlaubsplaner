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
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false)

  // Trip Sync state
  const [isSyncingTrip, setIsSyncingTrip] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Calculate Metrics
  const totalSpent = useMemo(
    () => calculateTotalExpenses(budget.expenses),
    [budget.expenses]
  )

  const dailyAvg = useMemo(
    () => calculateDailyAverage(budget.expenses, budget.startDate, budget.endDate),
    [budget.expenses, budget.startDate, budget.endDate]
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
        setSyncFeedback(res.message || "Kosten erfolgreich synchronisiert!")
        setTimeout(() => setSyncFeedback(null), 4000)
      } else {
        setSyncFeedback(res.error || "Fehler bei der Synchronisation.")
        setTimeout(() => setSyncFeedback(null), 4000)
      }
    } catch (err: any) {
      setSyncFeedback(err.message || "Fehler beim Synchronisieren.")
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
      router.push("/budget")
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
      alert("Fehler beim Löschen des Budgets.")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Back button & Title Bar */}
      <div className="flex flex-col gap-3">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#161f28] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Bearbeiten</span>
            </button>
            <button
              onClick={handleDeleteBudget}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              title="Budget löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Dates */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-medium">
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
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Gesamtausgaben
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalSpent, budget.currency)}
            </span>
          </div>
          {hasLimit ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Limit: {formatCurrency(budget.totalBudget, budget.currency)}</span>
                <span className={isOverBudget ? "text-rose-500 font-bold" : ""}>
                  {Math.round((totalSpent / budget.totalBudget!) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
            <span className="text-xs text-slate-400">Kein Limit festgelegt</span>
          )}
        </div>

        {/* Daily Average */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Ø Kosten pro Tag
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(dailyAvg.avgPerDay, budget.currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Über {dailyAvg.daysCount} Reisetag{dailyAvg.daysCount === 1 ? "" : "e"}
          </span>
        </div>

        {/* Per Person Average */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Ø Kosten pro Person
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {formatCurrency(perPersonAvg, budget.currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Aufgeteilt auf {budget.participants.length} Teilnehmer
          </span>
        </div>

        {/* Trip Sync or Participants Count */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reise-Synchronisation
          </span>
          
          {budget.trip ? (
            <div className="my-1 flex flex-col gap-2">
              <button
                onClick={handleSyncTripCost}
                disabled={isSyncingTrip}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                title="Aktualisiert das Feld 'cost' der verknüpften Reise im Kalender"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${isSyncingTrip ? "animate-spin" : ""}`} />
                <span>Kosten in Reise übernehmen</span>
              </button>

              {syncFeedback && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {syncFeedback}
                </span>
              )}
            </div>
          ) : (
            <div className="my-2">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Eigenständiges Budget
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nicht mit einer Kalender-Reise verknüpft.
              </p>
            </div>
          )}

          <span className="text-[11px] text-slate-400">
            {budget.expenses.length} Ausgaben gebucht
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-4 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "expenses"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Ausgaben</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {budget.expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
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
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
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
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teilnehmer</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
        }}
        budgetId={budget.id}
        currency={budget.currency}
        participants={budget.participants}
        categories={budget.categories}
        expenseToEdit={expenseToEdit}
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
