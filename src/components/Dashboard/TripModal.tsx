"use client"

import { useState, useEffect } from "react"
import { X, Save, Trash2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { Trip, TripType, TripStatus } from "@/types"
import { createTrip, updateTrip, deleteTrip } from "@/app/actions/tripActions"

interface TripModalProps {
  isOpen: boolean
  onClose: () => void
  trip?: Trip | null
}

const TYPE_OPTIONS = ["Urlaub", "Mobiles Arbeiten", "Sonderurlaub", "Sabbatical", "Überstundenabbau"]
const STATUS_OPTIONS = ["Idee", "In Planung", "Gebucht", "Abgeschlossen"]
const TRAVEL_TYPE_OPTIONS = ["", "Wanderurlaub", "Städtetrip", "Strandurlaub", "Heimatbesuch", "Rundreise", "Skiurlaub", "Wellness", "Roadtrip", "Aktivurlaub", "Kombi-Reise"]
const TRANSPORT_OPTIONS = ["", "Flugzeug", "Mietwagen", "Bahn", "Eigenes Auto", "Schiff", "Fahrrad"]

export default function TripModal({ isOpen, onClose, trip }: TripModalProps) {
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    selectedProfileIds: [] as string[],
    externalParticipants: "",
    type: TYPE_OPTIONS[0] as TripType,
    status: STATUS_OPTIONS[0] as TripStatus,
    location: "",
    travelType: "",
    transport: [] as string[],
    notes: "",
    budget: "" as number | "",
    cost: "" as number | ""
  })

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const { title, startDate, endDate, selectedProfileIds, externalParticipants, type, status, location, travelType, transport, notes, budget, cost } = formData

  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (trip) {
        setFormData({
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          selectedProfileIds: trip.profiles.map(p => p.id),
          externalParticipants: trip.externalParticipants || "",
          type: trip.type as TripType,
          status: trip.status as TripStatus,
          location: trip.location || "",
          travelType: trip.travelType || "",
          transport: trip.transport ? trip.transport.split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: trip.notes || "",
          budget: trip.budget || "",
          cost: trip.cost || ""
        })
      } else {
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          selectedProfileIds: activeProfileIds,
          externalParticipants: "",
          type: TYPE_OPTIONS[0] as TripType,
          status: STATUS_OPTIONS[0] as TripStatus,
          location: "",
          travelType: "",
          transport: [],
          notes: "",
          budget: "",
          cost: ""
        })
      }
      setShowConfirmDelete(false)
    }
  }, [isOpen, trip, activeProfileIds])

  if (!isOpen) return null

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0
    const d1 = new Date(start)
    const d2 = new Date(end)
    const diffTime = d2.getTime() - d1.getTime()
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startDate || !endDate || selectedProfileIds.length === 0) return

    setIsSaving(true)
    
    const duration = calculateDuration(startDate, endDate)
    const payload = {
      title,
      startDate,
      endDate,
      duration,
      profileIds: selectedProfileIds,
      externalParticipants: externalParticipants || null,
      type,
      status,
      location: location || null,
      travelType: travelType || null,
      transport: transport.length > 0 ? transport.join(', ') : null,
      notes: notes || null,
      budget: budget === "" ? null : Number(budget),
      cost: cost === "" ? null : Number(cost)
    }

    try {
      let savedTrip: Trip;
      if (trip) {
        savedTrip = await updateTrip(trip.id, payload) as Trip
        // update local store optimally
        const currentTrips = useStore.getState().trips
        useStore.getState().setTrips(currentTrips.map(t => t.id === savedTrip.id ? savedTrip : t))
      } else {
        savedTrip = await createTrip(payload) as Trip
        const currentTrips = useStore.getState().trips
        useStore.getState().setTrips([...currentTrips, savedTrip])
      }

      // Optimistic Cleanup of overlapping entries in the store
      const blockingStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
      if (blockingStatuses.includes(savedTrip.status)) {
        const currentEntries = useStore.getState().entries
        const filteredEntries = currentEntries.filter(e => {
          const inRange = e.date >= savedTrip.startDate && e.date <= savedTrip.endDate
          const inProfile = savedTrip.profiles.some(p => p.id === e.profileId)
          return !(inRange && inProfile)
        })
        useStore.getState().setEntries(filteredEntries)
      }

      onClose()
    } catch (error) {
      console.error("Failed to save trip", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!trip) return
    setIsSaving(true)
    try {
      await deleteTrip(trip.id)
      const currentTrips = useStore.getState().trips
      useStore.getState().setTrips(currentTrips.filter(t => t.id !== trip.id))
      onClose()
    } catch (error) {
      console.error("Failed to delete trip", error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleProfile = (profileId: string) => {
    updateForm({
      selectedProfileIds: selectedProfileIds.includes(profileId)
        ? selectedProfileIds.filter(id => id !== profileId)
        : [...selectedProfileIds, profileId]
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-[var(--surface)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[var(--border-subtle)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-[var(--border-subtle)] bg-slate-50/50 dark:bg-black/20 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {trip ? "Reise bearbeiten" : "Neue Reise anlegen"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="trip-form" onSubmit={handleSave} className="flex flex-col gap-8">
            
            {/* Grunddaten */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Grunddaten</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titel der Reise *</label>
                  <input required value={title} onChange={e => updateForm({ title: e.target.value })} type="text" placeholder="z.B. Sommerurlaub Italien" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Startdatum *</label>
                  <input required value={startDate} onChange={e => updateForm({ startDate: e.target.value })} type="date" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enddatum *</label>
                  <input required value={endDate} onChange={e => updateForm({ endDate: e.target.value })} type="date" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Teilnehmer */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Teilnehmer</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">App-Profile (Für Kalender-Sync) *</label>
                <div className="flex flex-wrap gap-2">
                  {profiles.filter(p => p.id !== 'ALLE_FERIEN').map(p => {
                    const isSelected = selectedProfileIds.includes(p.id)
                    return (
                      <div 
                        key={p.id}
                        onClick={() => toggleProfile(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition-colors flex items-center gap-2 ${isSelected ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                        {p.name}
                      </div>
                    )
                  })}
                </div>
                {selectedProfileIds.length === 0 && <span className="text-xs text-red-500">Bitte wähle mindestens ein Profil aus.</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Externe Teilnehmer (Optional)</label>
                <input value={externalParticipants} onChange={e => updateForm({ externalParticipants: e.target.value })} type="text" placeholder="z.B. Oma, Opa, Hund" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
            </section>

            {/* Klassifizierung */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Klassifizierung & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Art der Reise *</label>
                  <select required value={type} onChange={e => updateForm({ type: e.target.value as TripType })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none appearance-none">
                    {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktueller Status *</label>
                  <select required value={status} onChange={e => updateForm({ status: e.target.value as TripStatus })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none appearance-none">
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Reisedetails */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Details (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ort / Land</label>
                  <input value={location} onChange={e => updateForm({ location: e.target.value })} type="text" placeholder="z.B. Mallorca" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reisetyp</label>
                  <select value={travelType} onChange={e => updateForm({ travelType: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none appearance-none">
                    {TRAVEL_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || "Bitte wählen..."}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Transportmittel (Mehrfachauswahl)</label>
                  <div className="flex flex-wrap gap-2">
                    {TRANSPORT_OPTIONS.filter(opt => opt !== "").map(opt => {
                      const isSelected = transport.includes(opt)
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            updateForm({
                              transport: isSelected ? transport.filter(t => t !== opt) : [...transport, opt]
                            })
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' 
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Geplantes Budget (€)</label>
                  <input value={budget} onChange={e => updateForm({ budget: e.target.value ? Number(e.target.value) : "" })} type="number" min="0" step="0.01" placeholder="0.00" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tatsächliche Kosten (€)</label>
                  <input value={cost} onChange={e => updateForm({ cost: e.target.value ? Number(e.target.value) : "" })} type="number" min="0" step="0.01" placeholder="0.00" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notizen / Links</label>
                <textarea value={notes} onChange={e => updateForm({ notes: e.target.value })} rows={3} placeholder="Hotel links, Checklisten, etc." className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none resize-none"></textarea>
              </div>
            </section>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-[var(--border-subtle)] bg-slate-50 dark:bg-black/20 flex justify-between shrink-0">
          {trip ? (
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          ) : null}
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit"
              form="trip-form"
              disabled={isSaving || selectedProfileIds.length === 0}
              className="px-6 py-2 text-brand-600 dark:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 disabled:opacity-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
