"use client"

import React, { useState, useEffect } from "react"
import { X, Plus, Save, Trash2, Calendar, DollarSign, Users, Plane } from "lucide-react"
import { Profile, Trip } from "@/types"
import { createTripBudget, updateTripBudget } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"

interface CreateBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  profiles: Profile[]
  trips: Trip[]
  selectedYear: number
  budgetToEdit?: any | null
}

export default function CreateBudgetModal({
  isOpen,
  onClose,
  profiles,
  trips,
  selectedYear,
  budgetToEdit,
}: CreateBudgetModalProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [totalBudget, setTotalBudget] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedTripId, setSelectedTripId] = useState<string>("")
  
  // Real profiles (excluding ALLE_FERIEN)
  const realProfiles = profiles.filter((p) => p.id !== "ALLE_FERIEN")
  
  // Selected Profile IDs
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([])
  
  // Custom Guest Participants
  const [guests, setGuests] = useState<{ id: string; name: string; color: string }[]>([])
  const [newGuestName, setNewGuestName] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (budgetToEdit) {
      setName(budgetToEdit.name || "")
      setCurrency(budgetToEdit.currency || "EUR")
      setTotalBudget(budgetToEdit.totalBudget ? budgetToEdit.totalBudget.toString() : "")
      setStartDate(budgetToEdit.startDate || "")
      setEndDate(budgetToEdit.endDate || "")
      setSelectedTripId(budgetToEdit.tripId || "")
    } else {
      setName("")
      setCurrency("EUR")
      setTotalBudget("")
      setStartDate("")
      setEndDate("")
      setSelectedTripId("")
      // Default: select all real profiles
      setSelectedProfileIds(realProfiles.map((p) => p.id))
      setGuests([])
      setNewGuestName("")
      setError(null)
    }
  }, [isOpen, budgetToEdit])

  // Handle Trip Selection auto-fill
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId)
    if (!tripId) return

    const trip = trips.find((t) => t.id === tripId)
    if (trip) {
      if (!name) setName(trip.title)
      if (trip.startDate) setStartDate(trip.startDate)
      if (trip.endDate) setEndDate(trip.endDate)
      if (trip.budget) setTotalBudget(trip.budget.toString())

      // Auto-select trip profiles
      if (trip.profiles && trip.profiles.length > 0) {
        const tripProfileIds = trip.profiles.map((p) => p.id).filter((id) => id !== "ALLE_FERIEN")
        setSelectedProfileIds(tripProfileIds)
      }
    }
  }

  const handleToggleProfile = (profileId: string) => {
    setSelectedProfileIds((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    )
  }

  const handleAddGuest = () => {
    const trimmed = newGuestName.trim()
    if (!trimmed) return
    const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#06b6d4", "#f97316"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    setGuests((prev) => [
      ...prev,
      {
        id: "guest_" + Date.now(),
        name: trimmed,
        color: randomColor,
      },
    ])
    setNewGuestName("")
  }

  const handleRemoveGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Bitte gib einen Namen für das Reise-Budget an.")
      return
    }

    if (startDate && endDate && startDate > endDate) {
      setError("Das Startdatum darf nicht nach dem Enddatum liegen.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (budgetToEdit) {
        const res = await updateTripBudget(budgetToEdit.id, {
          name: name.trim(),
          currency,
          totalBudget: totalBudget ? parseFloat(totalBudget) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          tripId: selectedTripId || null,
        })
        if (!res.success) {
          setError(res.error || "Fehler beim Aktualisieren")
          useStore.getState().addToast({
            type: "error",
            title: "Fehler beim Speichern",
            description: res.error || "Das Reise-Budget konnte nicht aktualisiert werden.",
          })
          setIsSubmitting(false)
          return
        }

        useStore.getState().addToast({
          type: "success",
          title: "Budget aktualisiert",
          description: `Änderungen an "${name.trim()}" wurden gespeichert.`,
        })
      } else {
        // Collect initial participants
        const initialParticipants = [
          ...selectedProfileIds.map((pId) => {
            const p = realProfiles.find((prof) => prof.id === pId)
            return {
              profileId: pId,
              name: p ? p.name : "Teilnehmer",
              color: p ? p.color : "#3b82f6",
            }
          }),
          ...guests.map((g) => ({
            profileId: null,
            name: g.name,
            color: g.color,
          })),
        ]

        if (initialParticipants.length === 0) {
          setError("Bitte wähle mindestens einen Teilnehmer oder Gast aus.")
          setIsSubmitting(false)
          return
        }

        const res = await createTripBudget({
          name: name.trim(),
          currency,
          totalBudget: totalBudget ? parseFloat(totalBudget) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          tripId: selectedTripId || null,
          initialParticipants,
        })

        if (!res.success) {
          setError(res.error || "Fehler beim Erstellen")
          useStore.getState().addToast({
            type: "error",
            title: "Fehler beim Erstellen",
            description: res.error || "Das Reise-Budget konnte nicht angelegt werden.",
          })
          setIsSubmitting(false)
          return
        }

        useStore.getState().addToast({
          type: "success",
          title: "Budget angelegt",
          description: `Reise-Budget "${name.trim()}" wurde erfolgreich erstellt.`,
        })

        if (res.data?.id) {
          onClose()
          router.push(`/budget/${res.data.id}`)
          return
        }
      }

      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Unerwarteter Fehler")
      useStore.getState().addToast({
        type: "error",
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {budgetToEdit ? "Reise-Budget bearbeiten" : "Neues Reise-Budget anlegen"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar p-6 gap-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Optional Trip Link */}
          {!budgetToEdit && trips.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Mit bestehender Reise verknüpfen (Optional)
              </label>
              <div className="relative">
                <select
                  value={selectedTripId}
                  onChange={(e) => handleTripChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">-- Eigenständiges Budget (Keine Verknüpfung) --</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.startDate} {t.endDate ? `bis ${t.endDate}` : ""})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Budget Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Name der Reise / des Budgets *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Sommerurlaub Mallorca, Roadtrip Norwegen"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Currency & Total Budget Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Währung
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF (CHF)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Geplantes Budgetlimit (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="z. B. 1500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Startdatum
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value
                  setStartDate(newStart)
                  if (endDate && newStart && endDate < newStart) {
                    setEndDate(newStart)
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Enddatum
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Participants Selection (Only when creating) */}
          {!budgetToEdit && (
            <div className="border-t border-slate-100 dark:border-white/10 pt-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Reiseteilnehmer auswählen *
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {realProfiles.map((prof) => {
                  const isSelected = selectedProfileIds.includes(prof.id)
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => handleToggleProfile(prof.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-brand-50 dark:bg-brand-500/15 border-brand-500/40 text-brand-700 dark:text-brand-300 shadow-xs"
                          : "bg-slate-50/80 dark:bg-[#070c12]/60 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 opacity-60"
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: prof.color }}
                      />
                      <span>{prof.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Guest list */}
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {guests.map((g) => (
                    <div
                      key={g.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                      <span>{g.name} (Gast)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGuest(g.id)}
                        className="hover:text-rose-500 transition-colors cursor-pointer ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Guest input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddGuest()
                    }
                  }}
                  placeholder="Externen Gast hinzufügen (z. B. Freund)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddGuest}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-700 dark:text-slate-300 hover:text-brand-600 text-xs font-semibold border border-slate-200/80 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gast</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions (Pop-up 2nd Level - Schlichter Button Standard) */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl font-medium transition-colors cursor-pointer text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{isSubmitting ? "Wird gespeichert..." : budgetToEdit ? "Speichern" : "Budget anlegen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
