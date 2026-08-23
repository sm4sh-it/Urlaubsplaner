"use client"

import React, { useState } from "react"
import { X, UserPlus, Users, Check } from "lucide-react"
import { Profile, BudgetParticipant } from "@/types"
import { addBudgetParticipant } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string
  existingParticipants: BudgetParticipant[]
  allProfiles: Profile[]
}

export default function AddParticipantModal({
  isOpen,
  onClose,
  budgetId,
  existingParticipants,
  allProfiles,
}: AddParticipantModalProps) {
  const router = useRouter()
  const realProfiles = allProfiles.filter((p) => p.id !== "ALLE_FERIEN")

  const [mode, setMode] = useState<"profile" | "guest">("profile")
  const [selectedProfileId, setSelectedProfileId] = useState<string>("")
  const [guestName, setGuestName] = useState("")
  const [guestColor, setGuestColor] = useState("#f59e0b")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter profiles that are not already participants
  const existingProfileIds = existingParticipants
    .map((p) => p.profileId)
    .filter(Boolean) as string[]

  const availableProfiles = realProfiles.filter(
    (p) => !existingProfileIds.includes(p.id)
  )

  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#64748b",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === "profile") {
        if (!selectedProfileId) {
          setError("Bitte wähle ein Profil aus.")
          setIsSubmitting(false)
          return
        }

        const prof = realProfiles.find((p) => p.id === selectedProfileId)
        if (!prof) {
          setError("Profil nicht gefunden.")
          setIsSubmitting(false)
          return
        }

        const res = await addBudgetParticipant(budgetId, {
          profileId: prof.id,
          name: prof.name,
          color: prof.color,
        })

        if (!res.success) {
          setError(res.error || "Fehler beim Hinzufügen")
          useStore.getState().addToast({
            type: "error",
            title: "Fehler beim Hinzufügen",
            description: res.error || "Teilnehmer konnte nicht hinzugefügt werden.",
          })
          setIsSubmitting(false)
          return
        }

        useStore.getState().addToast({
          type: "success",
          title: "Teilnehmer hinzugefügt",
          description: `"${prof.name}" ist dem Budget beigetreten.`,
        })
      } else {
        if (!guestName.trim()) {
          setError("Bitte gib einen Namen für den Gast ein.")
          setIsSubmitting(false)
          return
        }

        const res = await addBudgetParticipant(budgetId, {
          profileId: null,
          name: guestName.trim(),
          color: guestColor,
        })

        if (!res.success) {
          setError(res.error || "Fehler beim Hinzufügen")
          useStore.getState().addToast({
            type: "error",
            title: "Fehler beim Hinzufügen",
            description: res.error || "Gast konnte nicht hinzugefügt werden.",
          })
          setIsSubmitting(false)
          return
        }

        useStore.getState().addToast({
          type: "success",
          title: "Gast hinzugefügt",
          description: `Gast "${guestName.trim()}" ist dem Budget beigetreten.`,
        })
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Teilnehmer hinzufügen
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("profile")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === "profile"
                  ? "bg-white dark:bg-[#161f28] text-slate-800 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Aus Profilen wählen
            </button>
            <button
              type="button"
              onClick={() => setMode("guest")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === "guest"
                  ? "bg-white dark:bg-[#161f28] text-slate-800 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Externer Gast
            </button>
          </div>

          {mode === "profile" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Verfügbare Profile
              </label>
              {availableProfiles.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
                  Alle vorhandenen Profile sind diesem Budget bereits beigetreten.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableProfiles.map((p) => {
                    const isSelected = selectedProfileId === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-50 dark:bg-brand-500/15 border-brand-500/50 text-slate-800 dark:text-slate-100 ring-1 ring-brand-500/30"
                            : "bg-slate-50/80 dark:bg-[#070c12]/60 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>{p.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Name des Gasts *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="z. B. Julia, Lukas, Oma..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Farbe
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGuestColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        guestColor === c ? "scale-115 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions (Pop-up 2nd Level - Schlichter Button Standard) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl font-medium transition-colors cursor-pointer text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (mode === "profile" && !selectedProfileId)}
              className="px-6 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 text-brand-500" />
              <span>{isSubmitting ? "Wird hinzugefügt..." : "Hinzufügen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
