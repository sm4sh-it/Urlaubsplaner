"use client"

import * as React from "react"
import { Profile } from "@/types"
import { createProfile, updateProfile } from "@/app/actions"
import { useRouter } from "next/navigation"
import {
  X,
  UserPlus,
  Edit3,
  Palette,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileToEdit?: Profile | null
  onSaveSuccess: (savedProfile: Profile) => void
}

const PRESET_COLORS = [
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#64748b", // Slate
]

const GERMAN_STATES = [
  { code: "BW", name: "Baden-Württemberg" },
  { code: "BY", name: "Bayern" },
  { code: "BE", name: "Berlin" },
  { code: "BB", name: "Brandenburg" },
  { code: "HB", name: "Bremen" },
  { code: "HH", name: "Hamburg" },
  { code: "HE", name: "Hessen" },
  { code: "MV", name: "Mecklenburg-Vorpommern" },
  { code: "NI", name: "Niedersachsen" },
  { code: "NW", name: "Nordrhein-Westfalen" },
  { code: "RP", name: "Rheinland-Pfalz" },
  { code: "SL", name: "Saarland" },
  { code: "SN", name: "Sachsen" },
  { code: "ST", name: "Sachsen-Anhalt" },
  { code: "SH", name: "Schleswig-Holstein" },
  { code: "TH", name: "Thüringen" },
]

const DAYS_OF_WEEK = [
  { label: "Mo", value: 1 },
  { label: "Di", value: 2 },
  { label: "Mi", value: 3 },
  { label: "Do", value: 4 },
  { label: "Fr", value: 5 },
  { label: "Sa", value: 6 },
  { label: "So", value: 7 },
]

export default function ProfileModal({
  isOpen,
  onClose,
  profileToEdit,
  onSaveSuccess,
}: ProfileModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState<Omit<Profile, "id">>({
    name: "",
    color: "#10b981",
    annualLeave: 30,
    remainingLeave: 0,
    additionalLeave: 0,
    remainingLeaveExpiryDate: "03-31",
    stateCode: "NW",
    startYear: new Date().getFullYear(),
    workingDays: "1,2,3,4,5",
  })

  // Format DD.MM for German date input
  const [expiryInput, setExpiryInput] = React.useState("31.03")

  React.useEffect(() => {
    if (profileToEdit) {
      setFormData({
        name: profileToEdit.name,
        color: profileToEdit.color,
        annualLeave: profileToEdit.annualLeave,
        remainingLeave: profileToEdit.remainingLeave,
        additionalLeave: profileToEdit.additionalLeave,
        remainingLeaveExpiryDate: profileToEdit.remainingLeaveExpiryDate,
        stateCode: profileToEdit.stateCode,
        startYear: profileToEdit.startYear,
        workingDays: profileToEdit.workingDays,
      })
      const parts = (profileToEdit.remainingLeaveExpiryDate || "03-31").split("-")
      if (parts.length === 2) {
        setExpiryInput(`${parts[1]}.${parts[0]}`)
      } else {
        setExpiryInput("31.03")
      }
    } else {
      setFormData({
        name: "",
        color: "#10b981",
        annualLeave: 30,
        remainingLeave: 0,
        additionalLeave: 0,
        remainingLeaveExpiryDate: "03-31",
        stateCode: "NW",
        startYear: new Date().getFullYear(),
        workingDays: "1,2,3,4,5",
      })
      setExpiryInput("31.03")
    }
    setError(null)
  }, [isOpen, profileToEdit])

  if (!isOpen) return null

  const handleWorkingDayChange = (val: number) => {
    const currentDays = formData.workingDays
      ? formData.workingDays.split(",").map(Number)
      : []
    let newDays = []
    if (currentDays.includes(val)) {
      newDays = currentDays.filter((d) => d !== val)
    } else {
      newDays = [...currentDays, val]
    }
    setFormData({ ...formData, workingDays: newDays.sort().join(",") })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Convert DD.MM to MM-DD
      let parsedExpiry = "03-31"
      const parts = expiryInput.trim().split(".")
      if (parts.length === 2) {
        const day = parts[0].padStart(2, "0")
        const month = parts[1].padStart(2, "0")
        parsedExpiry = `${month}-${day}`
      }
      const finalData = { ...formData, remainingLeaveExpiryDate: parsedExpiry }

      if (profileToEdit) {
        const res = await updateProfile(profileToEdit.id, finalData)
        if (res.success && res.profile) {
          onSaveSuccess(res.profile as Profile)
          onClose()
          router.refresh()
        }
      } else {
        const res = await createProfile(finalData)
        if (res.success && res.profile) {
          onSaveSuccess(res.profile as Profile)
          onClose()
          router.refresh()
        }
      }
    } catch (err: any) {
      console.error("Fehler beim Speichern des Profils:", err)
      setError(err.message || "Unerwarteter Fehler beim Speichern.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeWorkingDays = formData.workingDays
    ? formData.workingDays.split(",").map(Number)
    : []

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: formData.color || "#10b981" }}
            >
              {profileToEdit ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {profileToEdit ? `Profil bearbeiten` : `Neues Profil anlegen`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {profileToEdit
                  ? `Passe die Einstellungen für ${profileToEdit.name} an.`
                  : `Erstelle ein neues Urlaubskonto für die Jahresplanung.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Name des Profils *
            </label>
            <input
              required
              type="text"
              placeholder="z. B. Alex, Partner, Kind..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium transition-all"
            />
          </div>

          {/* Farbe & Swatches */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-brand-500" />
              Profilfarbe *
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-12 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900"
                />
                <input
                  required
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                      formData.color.toLowerCase() === c.toLowerCase()
                        ? "border-slate-700 dark:border-white scale-110 shadow-sm"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bundesland (Feiertage) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              Bundesland (Feiertagsbasis) *
            </label>
            <select
              value={formData.stateCode}
              onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium cursor-pointer"
            >
              {GERMAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          {/* Kontingente Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              Urlaubsanspruch &amp; Kontingente
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3.5">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Startjahr
                </span>
                <input
                  required
                  type="number"
                  min="2022"
                  max="2100"
                  value={formData.startYear || new Date().getFullYear()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startYear: parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28] text-slate-700 dark:text-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Jahresurlaub
                </span>
                <input
                  required
                  type="number"
                  step="0.5"
                  value={formData.annualLeave}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annualLeave: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28] text-slate-700 dark:text-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Resturlaub
                </span>
                <input
                  required
                  type="number"
                  step="0.5"
                  value={formData.remainingLeave}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remainingLeave: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28] text-slate-700 dark:text-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Zusatzurlaub
                </span>
                <input
                  required
                  type="number"
                  step="0.5"
                  value={formData.additionalLeave}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalLeave: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f28] text-slate-700 dark:text-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Verfallsdatum Resturlaub */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              Verfallsdatum Resturlaub (Format: DD.MM) *
            </label>
            <input
              required
              type="text"
              placeholder="31.03"
              value={expiryInput}
              onChange={(e) => setExpiryInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          {/* Arbeitstage */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              Reguläre Arbeitstage der Woche
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = activeWorkingDays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleWorkingDayChange(day.value)}
                    className={`w-11 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-md ring-2 ring-brand-500/50"
                        : "bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {profileToEdit ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>{isSubmitting ? "Wird gespeichert..." : "Änderungen speichern"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? "Wird angelegt..." : "Profil anlegen"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
