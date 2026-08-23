"use client"

import React, { useState } from "react"
import { X, Tag, Plus, Save, RotateCcw, Sparkles } from "lucide-react"
import { createBudgetCategory, restoreDefaultBudgetCategories } from "@/app/actions/budgetActions"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"
import { AVAILABLE_CATEGORY_ICONS } from "./CategoryIcon"
import { DEFAULT_BUDGET_CATEGORIES } from "@/lib/budgetUtils"
import { BudgetCategory } from "@/types"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string
  existingCategories?: BudgetCategory[]
}

export default function CategoryModal({
  isOpen,
  onClose,
  budgetId,
  existingCategories = [],
}: CategoryModalProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [icon, setIcon] = useState("tag")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
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

  // Detect missing default categories
  const existingNames = new Set(existingCategories.map((c) => c.name.trim().toLowerCase()))
  const missingDefaults = DEFAULT_BUDGET_CATEGORIES.filter(
    (c) => !existingNames.has(c.name.trim().toLowerCase())
  )

  const handleSelectTemplate = (template: typeof DEFAULT_BUDGET_CATEGORIES[0]) => {
    setName(template.name)
    setColor(template.color)
    setIcon(template.icon)
    setError(null)
  }

  const handleRestoreAll = async () => {
    setIsRestoring(true)
    setError(null)
    try {
      const res = await restoreDefaultBudgetCategories(budgetId)
      if (res.success) {
        useStore.getState().addToast({
          type: "success",
          title: "Kategorien wiederhergestellt",
          description: "Standard-Kategorien wurden hinzugefügt.",
        })
        onClose()
        router.refresh()
      } else {
        setError(res.error || "Fehler beim Wiederherstellen.")
        useStore.getState().addToast({
          type: "error",
          title: "Fehler beim Wiederherstellen",
          description: res.error || "Standard-Kategorien konnten nicht wiederhergestellt werden.",
        })
      }
    } catch (err: any) {
      setError(err.message || "Unerwarteter Fehler.")
      useStore.getState().addToast({
        type: "error",
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
      })
    } finally {
      setIsRestoring(false)
    }
  }

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
        useStore.getState().addToast({
          type: "error",
          title: "Fehler beim Anlegen",
          description: res.error || "Die Kategorie konnte nicht angelegt werden.",
        })
        setIsSubmitting(false)
        return
      }

      useStore.getState().addToast({
        type: "success",
        title: "Kategorie erstellt",
        description: `Kategorie "${name.trim()}" wurde erfolgreich angelegt.`,
      })

      setName("")
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
            Kategorie anlegen &amp; verwalten
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

          {/* Missing Default Categories Template Section */}
          {missingDefaults.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fehlende Standard-Kategorien ({missingDefaults.length})
                </span>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  disabled={isRestoring}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3 h-3 ${isRestoring ? "animate-spin" : ""}`} />
                  <span>Alle wiederherstellen</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {missingDefaults.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#0d141d] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors cursor-pointer shadow-2xs"
                    title={`Als Vorlage einfügen: ${tmpl.name}`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.color }} />
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Icon auswählen
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {AVAILABLE_CATEGORY_ICONS.find((i) => i.id === icon)?.label || "Ausgewählt"}
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {AVAILABLE_CATEGORY_ICONS.map((ic) => {
                const IconComp = ic.icon
                const isSelected = icon === ic.id
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIcon(ic.id)}
                    className={`h-11 w-full rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/40 shadow-xs"
                        : "bg-slate-50/80 dark:bg-[#070c12]/60 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    title={ic.label}
                    aria-label={ic.label}
                  >
                    <IconComp className="w-5 h-5 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>

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
              disabled={isSubmitting}
              className="px-6 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-brand-500" />
              <span>{isSubmitting ? "Wird gespeichert..." : "Kategorie anlegen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
