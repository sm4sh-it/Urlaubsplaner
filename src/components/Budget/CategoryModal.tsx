"use client"

import React, { useState } from "react"
import { X, Tag, Plus } from "lucide-react"
import { createBudgetCategory } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import { AVAILABLE_CATEGORY_ICONS } from "./CategoryIcon"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string
}

export default function CategoryModal({ isOpen, onClose, budgetId }: CategoryModalProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [icon, setIcon] = useState("tag")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#64748b",
    "#ef4444",
  ]

  const icons = [
    { id: "tag", label: "Tag" },
    { id: "home", label: "Unterkunft" },
    { id: "plane", label: "Flug" },
    { id: "car", label: "Fahrt" },
    { id: "utensils", label: "Essen" },
    { id: "coffee", label: "Café" },
    { id: "ticket", label: "Tickets" },
    { id: "shopping-bag", label: "Shopping" },
    { id: "sparkles", label: "Sonstiges" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Bitte gib einen Kategorie-Namen an.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await createBudgetCategory(budgetId, {
        name: name.trim(),
        color,
        icon,
      })

      if (!res.success) {
        setError(res.error || "Fehler beim Anlegen")
        setIsSubmitting(false)
        return
      }

      setName("")
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">
              Neue Ausgabenkategorie
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Name der Kategorie *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Mautgebühren, Strandliegen, Souvenirs..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28]/70 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c ? "scale-115 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Icon auswählen
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
              {AVAILABLE_CATEGORY_ICONS.map((ic) => {
                const IconComp = ic.icon
                const isSelected = icon === ic.id
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIcon(ic.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer gap-1 ${
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500 font-bold"
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                    title={ic.label}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate w-full text-center text-[10px]">{ic.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-[#161f28]/70 hover:bg-[#fafafa] dark:hover:bg-[#1e2a36]/90 border border-slate-300 dark:border-slate-700/80 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-500/10 active:translate-y-0 active:scale-[0.98] transition-all duration-300 backdrop-blur-md cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-brand-500" />
              <span>{isSubmitting ? "Wird gespeichert..." : "Kategorie anlegen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
