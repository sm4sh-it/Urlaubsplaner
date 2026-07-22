"use client"

import * as React from "react"
import { Profile } from "@/types"
import { createProfile, updateProfile, deleteProfile } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Users, UserPlus, Edit3, Trash2, Database, RefreshCw, Palette, Calendar, MapPin, Clock } from "lucide-react"

export default function SettingsClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const router = useRouter()
  const [profiles, setProfiles] = React.useState<Profile[]>(initialProfiles)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = React.useState<Omit<Profile, 'id'>>({
    name: "",
    color: "#10b981",
    annualLeave: 30,
    remainingLeave: 0,
    additionalLeave: 0,
    remainingLeaveExpiryDate: "03-31",
    stateCode: "NW",
    startYear: new Date().getFullYear(),
    workingDays: "1,2,3,4,5"
  })

  // Spezieller State für die Eingabe im deutschen Format DD.MM
  const [expiryInput, setExpiryInput] = React.useState("31.03")

  const handleEdit = (profile: Profile) => {
    setEditingId(profile.id)
    setFormData({
      name: profile.name,
      color: profile.color,
      annualLeave: profile.annualLeave,
      remainingLeave: profile.remainingLeave,
      additionalLeave: profile.additionalLeave,
      remainingLeaveExpiryDate: profile.remainingLeaveExpiryDate,
      stateCode: profile.stateCode,
      startYear: profile.startYear,
      workingDays: profile.workingDays
    })
    setExpiryInput(profile.remainingLeaveExpiryDate.split('-').reverse().join('.'))
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      name: "", color: "#10b981", annualLeave: 30, remainingLeave: 0,
      additionalLeave: 0, remainingLeaveExpiryDate: "03-31", stateCode: "NW", startYear: new Date().getFullYear(), workingDays: "1,2,3,4,5"
    })
    setExpiryInput("31.03")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Konvertiere DD.MM zurück zu MM-DD vor dem Speichern
    let parsedExpiry = "03-31" // Fallback
    const parts = expiryInput.split('.')
    if (parts.length === 2) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      parsedExpiry = `${month}-${day}`
    }
    const finalData = { ...formData, remainingLeaveExpiryDate: parsedExpiry }

    if (editingId) {
      const res = await updateProfile(editingId, finalData)
      if (res.success && res.profile) {
        setProfiles(profiles.map(p => p.id === editingId ? res.profile : p))
        handleCancel()
        router.refresh()
      }
    } else {
      const res = await createProfile(finalData)
      if (res.success && res.profile) {
        setProfiles([...profiles, res.profile])
        handleCancel()
        router.refresh()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Profil wirklich löschen? Alle Einträge werden ebenfalls entfernt!")) {
      await deleteProfile(id)
      setProfiles(profiles.filter(p => p.id !== id))
      router.refresh()
    }
  }

  const handleSyncData = async () => {
    const statesToSync = Array.from(new Set(profiles.map(p => p.stateCode)))
    if (statesToSync.length === 0) return
    
    const year = new Date().getFullYear()
    alert(`Feiertage & Ferien werden für ${statesToSync.length} Bundesländer (Jahr ${year}) heruntergeladen und lokal gespeichert...`)
    
    const { syncCalendarData } = await import('@/app/actions')
    let success = true
    for (const state of statesToSync) {
      const res = await syncCalendarData(year, state)
      if (!res.success) success = false
    }

    if (success) {
      alert("Erfolgreich synchronisiert und lokal gespeichert!")
    } else {
      alert("Fehler bei der Synchronisation!")
    }
  }

  const daysOfWeek = [
    { label: 'Mo', value: 1 },
    { label: 'Di', value: 2 },
    { label: 'Mi', value: 3 },
    { label: 'Do', value: 4 },
    { label: 'Fr', value: 5 },
    { label: 'Sa', value: 6 },
    { label: 'So', value: 7 }
  ]

  const handleWorkingDayChange = (val: number) => {
    const currentDays = formData.workingDays ? formData.workingDays.split(',').map(Number) : []
    let newDays = []
    if (currentDays.includes(val)) {
      newDays = currentDays.filter(d => d !== val)
    } else {
      newDays = [...currentDays, val]
    }
    setFormData({ ...formData, workingDays: newDays.sort().join(',') })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Profil-Liste & System Sync */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#0d1117] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-brand-500" />
            Vorhandene Profile ({profiles.length})
          </h2>
          <div className="space-y-3">
            {profiles.length === 0 ? (
              <div className="text-slate-500 text-sm py-4 text-center">Keine Profile angelegt.</div>
            ) : (
              profiles.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.stateCode} · {p.annualLeave} Urlaubstage
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => handleEdit(p)} 
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Profil bearbeiten"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Profil löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System & Caching Bereich */}
        <div className="bg-white dark:bg-[#0d1117] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Feiertage &amp; Ferien Daten-Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lokale Speicherung in SQLite zur Vermeidung von API-Ladezeiten.</p>
            </div>
          </div>
          <button 
            onClick={handleSyncData} 
            className="w-full px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Feiertage &amp; Ferien jetzt synchronisieren
          </button>
        </div>
      </div>

      {/* Right Column: Formular */}
      <div className="lg:col-span-7">
        <div className="bg-white dark:bg-[#0d1117] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            {editingId ? <Edit3 className="w-5 h-5 text-brand-500" /> : <UserPlus className="w-5 h-5 text-brand-500" />}
            {editingId ? "Profil bearbeiten" : "Neues Profil anlegen"}
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Name des Profils
              </label>
              <input 
                required 
                type="text" 
                placeholder="z. B. Max Mustermann"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all" 
              />
            </div>
            
            {/* Farbe & Bundesland */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-brand-500" /> Profilfarbe
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={formData.color} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                    className="h-10 w-12 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900" 
                  />
                  <input 
                    required 
                    type="text" 
                    value={formData.color} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" /> Bundesland (Feiertage)
                </label>
                <select 
                  value={formData.stateCode} 
                  onChange={e => setFormData({...formData, stateCode: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all cursor-pointer"
                >
                  <option value="BW">Baden-Württemberg (BW)</option>
                  <option value="BY">Bayern (BY)</option>
                  <option value="BE">Berlin (BE)</option>
                  <option value="BB">Brandenburg (BB)</option>
                  <option value="HB">Bremen (HB)</option>
                  <option value="HH">Hamburg (HH)</option>
                  <option value="HE">Hessen (HE)</option>
                  <option value="MV">Mecklenburg-Vorpommern (MV)</option>
                  <option value="NI">Niedersachsen (NI)</option>
                  <option value="NW">Nordrhein-Westfalen (NW)</option>
                  <option value="RP">Rheinland-Pfalz (RP)</option>
                  <option value="SL">Saarland (SL)</option>
                  <option value="SN">Sachsen (SN)</option>
                  <option value="ST">Sachsen-Anhalt (ST)</option>
                  <option value="SH">Schleswig-Holstein (SH)</option>
                  <option value="TH">Thüringen (TH)</option>
                </select>
              </div>
            </div>

            {/* Kontingente & Tage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Startjahr</label>
                <input 
                  required 
                  type="number" 
                  min="2022" 
                  max="2100" 
                  value={formData.startYear || new Date().getFullYear()} 
                  onChange={e => setFormData({...formData, startYear: parseInt(e.target.value) || new Date().getFullYear()})} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jahresurlaub</label>
                <input 
                  required 
                  type="number" 
                  step="0.5" 
                  value={formData.annualLeave} 
                  onChange={e => setFormData({...formData, annualLeave: parseFloat(e.target.value) || 0})} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resturlaub</label>
                <input 
                  required 
                  type="number" 
                  step="0.5" 
                  value={formData.remainingLeave} 
                  onChange={e => setFormData({...formData, remainingLeave: parseFloat(e.target.value) || 0})} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Zusatzurlaub</label>
                <input 
                  required 
                  type="number" 
                  step="0.5" 
                  value={formData.additionalLeave} 
                  onChange={e => setFormData({...formData, additionalLeave: parseFloat(e.target.value) || 0})} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                />
              </div>
            </div>

            {/* Verfallsdatum */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" /> Verfallsdatum Resturlaub (DD.MM)
              </label>
              <input 
                required 
                type="text" 
                placeholder="31.03" 
                value={expiryInput} 
                onChange={e => setExpiryInput(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" 
              />
            </div>

            {/* Arbeitstage */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-500" /> Arbeitstage der Woche
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => {
                  const currentDays = formData.workingDays ? formData.workingDays.split(',').map(Number) : []
                  const isSelected = currentDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWorkingDayChange(day.value)}
                      className={`w-11 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-500/50' 
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                {editingId ? "Profil speichern" : "Profil anlegen"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all cursor-pointer text-sm"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
