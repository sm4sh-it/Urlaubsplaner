"use client"

import * as React from "react"
import { Profile } from "@/types"
import { deleteProfile } from "@/app/actions"
import { useRouter } from "next/navigation"
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Database,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
  Clock,
  Check,
  Briefcase,
} from "lucide-react"
import ProfileModal from "@/components/Settings/ProfileModal"

const STATE_NAMES: Record<string, string> = {
  BW: "Baden-Württemberg",
  BY: "Bayern",
  BE: "Berlin",
  BB: "Brandenburg",
  HB: "Bremen",
  HH: "Hamburg",
  HE: "Hessen",
  MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen",
  NW: "Nordrhein-Westfalen",
  RP: "Rheinland-Pfalz",
  SL: "Saarland",
  SN: "Sachsen",
  ST: "Sachsen-Anhalt",
  SH: "Schleswig-Holstein",
  TH: "Thüringen",
}

const DAY_LABELS: Record<number, string> = {
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa",
  7: "So",
}

export default function SettingsClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const router = useRouter()
  const [profiles, setProfiles] = React.useState<Profile[]>(initialProfiles)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [profileToEdit, setProfileToEdit] = React.useState<Profile | null>(null)

  // Feedback Toast State
  const [feedback, setFeedback] = React.useState<string | null>(null)

  // Sync State
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleOpenAdd = () => {
    setProfileToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (profile: Profile) => {
    setProfileToEdit(profile)
    setIsModalOpen(true)
  }

  const handleSaveSuccess = (savedProfile: Profile) => {
    const isEdit = profiles.some((p) => p.id === savedProfile.id)
    if (isEdit) {
      setProfiles((prev) => prev.map((p) => (p.id === savedProfile.id ? savedProfile : p)))
      showFeedback(`Profil "${savedProfile.name}" erfolgreich aktualisiert!`)
    } else {
      setProfiles((prev) => [...prev, savedProfile])
      showFeedback(`Neues Profil "${savedProfile.name}" erfolgreich erstellt!`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Möchtest du das Profil "${name}" wirklich unwiderruflich löschen? Alle zugehörigen Kalendereinträge werden ebenfalls entfernt.`
      )
    ) {
      return
    }

    try {
      await deleteProfile(id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      showFeedback(`Profil "${name}" wurde gelöscht.`)
      router.refresh()
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
      alert("Fehler beim Löschen des Profils.")
    }
  }

  const handleSyncData = async () => {
    const statesToSync = Array.from(new Set(profiles.map((p) => p.stateCode)))
    if (statesToSync.length === 0) return

    setIsSyncing(true)
    setSyncFeedback(null)

    try {
      const year = new Date().getFullYear()
      const { syncCalendarData } = await import("@/app/actions")
      let allOk = true
      for (const state of statesToSync) {
        const res = await syncCalendarData(year, state)
        if (!res.success) allOk = false
      }

      if (allOk) {
        setSyncFeedback(
          `Feiertage & Ferien für ${statesToSync.length} Bundesländer (Jahr ${year}) erfolgreich synchronisiert!`
        )
      } else {
        setSyncFeedback("Einige Daten konnten nicht synchronisiert werden.")
      }
      setTimeout(() => setSyncFeedback(null), 5000)
    } catch (err: any) {
      setSyncFeedback("Fehler bei der Synchronisation.")
      setTimeout(() => setSyncFeedback(null), 5000)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-[120] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-bottom-3 duration-300">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Profile &amp; Urlaubskonten ({profiles.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verwalte Urlaubsansprüche, Arbeitstage und Feiertagszuordnungen für alle Personen.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Neues Profil anlegen</span>
        </button>
      </div>

      {/* Profile Cards Grid */}
      {profiles.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            Noch keine Profile angelegt
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Lege dein erstes Profil an, um Urlaube, Feiertage und Arbeitszeiten im Kalender zu planen.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Jetzt Profil anlegen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => {
            const workingDayNumbers = p.workingDays
              ? p.workingDays.split(",").map(Number).filter(Boolean)
              : [1, 2, 3, 4, 5]
            const stateName = STATE_NAMES[p.stateCode] || p.stateCode

            return (
              <div
                key={p.id}
                className="group relative bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Bundesland & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-md shrink-0"
                        style={{ backgroundColor: p.color || "#10b981" }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-700 dark:text-slate-200 truncate">
                          {p.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{stateName} ({p.stateCode})</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="Profil bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Profil löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Leave Allowance Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 my-4 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3.5">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Jahresurlaub
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                        {p.annualLeave} Tage
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Resturlaub
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                        {p.remainingLeave} Tage
                        {p.remainingLeave > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (bis {p.remainingLeaveExpiryDate?.split("-").reverse().join(".") || "31.03."})
                          </span>
                        )}
                      </span>
                    </div>

                    {p.additionalLeave > 0 && (
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Zusatzurlaub
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                          {p.additionalLeave} Tage
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Startjahr
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                        {p.startYear}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Working Days Chips Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Arbeitstage:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                      const isActive = workingDayNumbers.includes(dayNum)
                      return (
                        <span
                          key={dayNum}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            isActive
                              ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        >
                          {DAY_LABELS[dayNum]}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* System & Caching Sync Card */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-brand-500/10 text-brand-500 rounded-2xl shrink-0 mt-0.5">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
              Feiertage &amp; Ferien Daten-Sync
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Lädt die offiziellen gesetzlichen Feiertage und Schulferien für alle zugewiesenen
              Bundesländer herunter und speichert sie lokal in der Datenbank für verzögerungsfreie Ladezeiten.
            </p>
            {syncFeedback && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                <Check className="w-4 h-4" />
                {syncFeedback}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSyncData}
          disabled={isSyncing || profiles.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-brand-500 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Wird synchronisiert..." : "Jetzt synchronisieren"}</span>
        </button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setProfileToEdit(null)
        }}
        profileToEdit={profileToEdit}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  )
}
