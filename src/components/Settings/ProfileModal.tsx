"use client"

import * as React from "react"
import { Profile } from "@/types"
import { createProfile, updateProfile } from "@/app/actions"
import { PROFILE_PRESET_COLORS } from "@/lib/profileUtils"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"
import {
  X,
  UserPlus,
  Edit3,
  Palette,
  Calendar,
  MapPin,
  Clock,
  Layers,
} from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileToEdit?: Profile | null
  onSaveSuccess: (savedProfile: Profile) => void
}

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
        if (res.profile) {
          onSaveSuccess(res.profile as Profile)
          useStore.getState().addToast({
            type: "success",
            title: "Profil aktualisiert",
            description: `Die Einstellungen für "${res.profile.name}" wurden gespeichert.`,
          })
          onClose()
          router.refresh()
        }
      } else {
        const res = await createProfile(finalData)
        if (res.profile) {
          onSaveSuccess(res.profile as Profile)
          useStore.getState().addToast({
            type: "success",
            title: "Profil angelegt",
            description: `Profil "${res.profile.name}" wurde erfolgreich erstellt.`,
          })
          onClose()
          router.refresh()
        }
      }
    } catch (err: any) {
      console.error("Fehler beim Speichern des Profils:", err)
      setError(err.message || "Unerwarteter Fehler beim Speichern.")
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Speichern",
        description: err.message || "Das Profil konnte nicht gespeichert werden.",
      })
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
        className="relative w-full max-w-xl bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Clean ohne vorangestelltes Icon) */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#070c12]/40">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {profileToEdit ? `Profil bearbeiten` : `Neues Profil anlegen`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {profileToEdit
                ? `Passe die Einstellungen für ${profileToEdit.name} an.`
                : `Erstelle ein neues Urlaubskonto für die Jahresplanung.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium transition-all"
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
                  className="h-10 w-12 rounded-xl cursor-pointer border border-slate-200 dark:border-white/10 p-1 bg-white dark:bg-[#0d141d]"
                />
                <input
                  required
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-xs font-mono font-medium focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {PROFILE_PRESET_COLORS.map(({ name, hex }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: hex })}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                      formData.color?.toLowerCase() === hex.toLowerCase()
                        ? "border-slate-700 dark:border-white scale-110 shadow-sm"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={`${name} (${hex})`}
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium cursor-pointer"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 truncate" title="Resturlaub zum Startjahr">
                  Start-Resturlaub
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070c12]/60 text-slate-800 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
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
                    className={`w-11 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-500/50"
                        : "bg-slate-100 dark:bg-[#070c12]/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10"
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
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
              {profileToEdit ? (
                <>
                  <Edit3 className="w-4 h-4 text-brand-500" />
                  <span>{isSubmitting ? "Wird gespeichert..." : "Änderungen speichern"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-brand-500" />
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
