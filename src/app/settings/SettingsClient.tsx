"use client"

import * as React from "react"
import { Profile } from "@/types"
import { createProfile, updateProfile, deleteProfile } from "@/app/actions"
import { useRouter } from "next/navigation"

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
    startYear: new Date().getFullYear()
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
      startYear: profile.startYear
    })
    setExpiryInput(profile.remainingLeaveExpiryDate.split('-').reverse().join('.'))
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      name: "", color: "#10b981", annualLeave: 30, remainingLeave: 0,
      additionalLeave: 0, remainingLeaveExpiryDate: "03-31", stateCode: "NW", startYear: new Date().getFullYear()
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
    
    const year = new Date().getFullYear() // Standardmäßig für aktuelles Jahr (später dynamisch)
    alert(`Feiertage & Ferien werden für ${statesToSync.length} Bundesländer (Jahr ${year}) heruntergeladen und lokal gespeichert...`)
    
    // Wir nutzen einen Server Action Import dafür
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profil-Liste */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Vorhandene Profile</h2>
          <div className="space-y-3">
            {profiles.length === 0 ? (
              <div className="text-slate-500">Keine Profile angelegt.</div>
            ) : (
              profiles.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-sm text-blue-600 hover:underline">Bearbeiten</button>
                    <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline">Löschen</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System & Caching Bereich */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold mb-2">System & Caching</h3>
          <p className="text-xs text-slate-500 mb-4">Feiertage und Schulferien werden in der Datenbank lokal gespeichert, um Ausfälle und Wartezeiten zu vermeiden.</p>
          <button onClick={handleSyncData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-sm">
            Feiertage & Ferien jetzt synchronisieren
          </button>
        </div>
      </div>

      {/* Formular */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Profil bearbeiten" : "Neues Profil anlegen"}</h2>
        <form onSubmit={handleSave} className="space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Farbe (Hex)</label>
              <div className="flex gap-2">
                <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="h-10 w-10 rounded cursor-pointer" />
                <input required type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bundesland</label>
              <select value={formData.stateCode} onChange={e => setFormData({...formData, stateCode: e.target.value})} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jahresurlaub</label>
              <input required type="number" step="0.5" value={formData.annualLeave} onChange={e => setFormData({...formData, annualLeave: parseFloat(e.target.value) || 0})} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resturlaub</label>
              <input required type="number" step="0.5" value={formData.remainingLeave} onChange={e => setFormData({...formData, remainingLeave: parseFloat(e.target.value) || 0})} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zusatzurlaub</label>
              <input required type="number" step="0.5" value={formData.additionalLeave} onChange={e => setFormData({...formData, additionalLeave: parseFloat(e.target.value) || 0})} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Verfallsdatum Resturlaub (DD.MM)</label>
            <input required type="text" placeholder="31.03" value={expiryInput} onChange={e => setExpiryInput(e.target.value)} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors">
              {editingId ? "Speichern" : "Anlegen"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded font-medium transition-colors">
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
