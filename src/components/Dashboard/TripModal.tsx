"use client"

import { useState, useEffect } from "react"
import { X, Save, Trash2, ChevronDown, Calendar, Palmtree, MapPin, DollarSign, FileText, Compass, Users } from "lucide-react"
import { useStore } from "@/store/useStore"
import { Trip, TripType, TripStatus } from "@/types"
import { createTrip, updateTrip, deleteTrip } from "@/app/actions/tripActions"
import { COUNTRIES } from "@/lib/countries"
import Avatar from "@/components/ui/Avatar"

interface TripModalProps {
  isOpen: boolean
  onClose: () => void
  trip?: Trip | null
}

const TYPE_OPTIONS = ["Urlaub", "Mobiles Arbeiten", "Sonderurlaub", "Sabbatical", "Überstundenabbau"]
const STATUS_OPTIONS = ["Idee", "In Planung", "Gebucht", "Abgeschlossen"]
const TRAVEL_TYPE_OPTIONS = ["", "Wanderurlaub", "Städtetrip", "Strandurlaub", "Heimatbesuch", "Rundreise", "Skiurlaub", "Wellness", "Roadtrip", "Aktivurlaub", "Kombi-Reise"]
const TRANSPORT_OPTIONS = ["", "Flugzeug", "Mietwagen", "Bahn", "Eigenes Auto", "Schiff", "Fahrrad", "Bus"]

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
    country: "",
    travelType: "",
    transport: [] as string[],
    notes: "",
    budget: "" as number | "",
    cost: "" as number | "",
    isHalfDay: false,
    halfDayType: "VORMITTAG"
  })

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const { title, startDate, endDate, selectedProfileIds, externalParticipants, type, status, location, country, travelType, transport, notes, budget, cost, isHalfDay, halfDayType } = formData

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
          country: trip.country || "",
          travelType: trip.travelType || "",
          transport: trip.transport ? trip.transport.split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: trip.notes || "",
          budget: trip.budget || "",
          cost: trip.cost || "",
          isHalfDay: trip.isHalfDay || false,
          halfDayType: trip.halfDayType || "VORMITTAG"
        })
      } else {
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          selectedProfileIds: activeProfileIds.includes('ALLE_FERIEN') 
            ? profiles.filter(p => p.id !== 'ALLE_FERIEN').map(p => p.id) 
            : activeProfileIds.filter(id => id !== 'ALLE_FERIEN'),
          externalParticipants: "",
          type: TYPE_OPTIONS[0] as TripType,
          status: STATUS_OPTIONS[1] as TripStatus, // Default to "In Planung"
          location: "",
          country: "",
          travelType: "",
          transport: [],
          notes: "",
          budget: "",
          cost: "",
          isHalfDay: false,
          halfDayType: "VORMITTAG"
        })
      }
      setShowConfirmDelete(false)
    }
  }, [isOpen, trip, activeProfileIds, profiles])

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
      profileIds: selectedProfileIds.filter(id => id !== 'ALLE_FERIEN'),
      externalParticipants: externalParticipants || null,
      type,
      status,
      location: location || null,
      country: country || null,
      travelType: travelType || null,
      transport: transport.length > 0 ? transport.join(', ') : null,
      notes: notes || null,
      budget: budget === "" ? null : Number(budget),
      cost: cost === "" ? null : Number(cost),
      isHalfDay,
      halfDayType: isHalfDay ? halfDayType : null
    }

    try {
      let savedTrip: Trip;
      if (trip) {
        savedTrip = await updateTrip(trip.id, payload) as Trip
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

      useStore.getState().addToast({
        type: "success",
        title: trip ? "Reise aktualisiert" : "Reise erfolgreich angelegt",
        description: `${savedTrip.title} wurde gespeichert.`,
      })

      onClose()
    } catch (error: any) {
      console.error("Failed to save trip", error)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Speichern",
        description: error.message || "Die Reise konnte nicht gespeichert werden.",
      })
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
      useStore.getState().addToast({
        type: "info",
        title: "Reise gelöscht",
        description: `${trip.title} wurde entfernt.`,
      })
      onClose()
    } catch (error: any) {
      console.error("Failed to delete trip", error)
      useStore.getState().addToast({
        type: "error",
        title: "Fehler beim Löschen",
        description: error.message || "Die Reise konnte nicht gelöscht werden.",
      })
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in-50">
      <div 
        className="bg-white dark:bg-[#0d141d] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#070c12]/40 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              {trip ? "Reise bearbeiten" : "Neue Reise anlegen"}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Urlaubszeitraum, Teilnehmer und Reisedetails verwalten
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            aria-label="Modal schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          <form id="trip-form" onSubmit={handleSave} className="flex flex-col gap-7">
            
            {/* Grunddaten */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 border-b border-slate-100 dark:border-white/10 pb-2">
                1. Grunddaten & Zeitraum
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Titel der Reise *
                  </label>
                  <input 
                    required 
                    value={title} 
                    onChange={e => updateForm({ title: e.target.value })} 
                    type="text" 
                    placeholder="z. B. Sommerurlaub Mallorca" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none" 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Startdatum *
                  </label>
                  <input 
                    required 
                    value={startDate} 
                    onChange={e => {
                      const newStart = e.target.value
                      if (endDate && newStart && endDate < newStart) {
                        updateForm({ startDate: newStart, endDate: newStart })
                      } else {
                        updateForm({ startDate: newStart })
                      }
                    }} 
                    type="date" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono" 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Enddatum *
                  </label>
                  <input 
                    required 
                    value={endDate} 
                    min={startDate || undefined}
                    onChange={e => updateForm({ endDate: e.target.value })} 
                    type="date" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono" 
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50/80 dark:bg-[#070c12]/50 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 select-none">
                      <input 
                        type="checkbox"
                        checked={isHalfDay}
                        onChange={e => updateForm({ isHalfDay: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span>Halber Urlaubstag (0.5)</span>
                    </label>

                    {isHalfDay && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateForm({ halfDayType: "VORMITTAG" })}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            halfDayType === "VORMITTAG" || !halfDayType
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-slate-200/80 dark:bg-[#161f28] text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#1e2a36]'
                          }`}
                        >
                          Vormittag (AM)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ halfDayType: "NACHMITTAG" })}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            halfDayType === "NACHMITTAG"
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-slate-200/80 dark:bg-[#161f28] text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#1e2a36]'
                          }`}
                        >
                          Nachmittag (PM)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Teilnehmer */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 border-b border-slate-100 dark:border-white/10 pb-2">
                2. Teilnehmer & Profile
              </h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  App-Profile (Für Kalender-Sync) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {profiles.filter(p => p.id !== 'ALLE_FERIEN').map(p => {
                    const isSelected = selectedProfileIds.includes(p.id)
                    return (
                      <button 
                        type="button"
                        key={p.id}
                        onClick={() => toggleProfile(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-brand-500/15 border-brand-500/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30 font-bold' 
                            : 'bg-slate-100/80 dark:bg-[#161f28]/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                        }`}
                      >
                        <Avatar name={p.name} color={p.color} size="xs" />
                        <span>{p.name}</span>
                      </button>
                    )
                  })}
                </div>
                {selectedProfileIds.length === 0 && (
                  <span className="text-xs text-rose-500 font-medium">Bitte wähle mindestens ein Profil aus.</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Externe Teilnehmer (Optional)
                </label>
                <input 
                  value={externalParticipants} 
                  onChange={e => updateForm({ externalParticipants: e.target.value })} 
                  type="text" 
                  placeholder="z. B. Oma, Freunde, Hund" 
                  className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none" 
                />
              </div>
            </section>

            {/* Klassifizierung & Status */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 border-b border-slate-100 dark:border-white/10 pb-2">
                3. Klassifizierung & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Art der Reise *
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      value={type} 
                      onChange={e => updateForm({ type: e.target.value as TripType })} 
                      className="w-full appearance-none bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 pr-9 text-sm transition-all outline-none cursor-pointer"
                    >
                      {TYPE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#0d141d]">{opt}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aktueller Status *
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      value={status} 
                      onChange={e => updateForm({ status: e.target.value as TripStatus })} 
                      className="w-full appearance-none bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 pr-9 text-sm transition-all outline-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#0d141d]">{opt}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Reisedetails */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 border-b border-slate-100 dark:border-white/10 pb-2">
                4. Reisedetails & Kosten (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Land
                  </label>
                  <input 
                    list="countries" 
                    value={country} 
                    onChange={e => updateForm({ country: e.target.value })} 
                    type="text" 
                    placeholder="Land auswählen oder tippen..." 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none" 
                  />
                  <datalist id="countries">
                    {COUNTRIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Ort / Region
                  </label>
                  <input 
                    value={location} 
                    onChange={e => updateForm({ location: e.target.value })} 
                    type="text" 
                    placeholder="z. B. Palma de Mallorca" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Reiseart
                  </label>
                  <div className="relative">
                    <select 
                      value={travelType} 
                      onChange={e => updateForm({ travelType: e.target.value })} 
                      className="w-full appearance-none bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 pr-9 text-sm transition-all outline-none cursor-pointer"
                    >
                      {TRAVEL_TYPE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#0d141d]">{opt || "Bitte wählen..."}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Transportmittel (Mehrfachauswahl)
                  </label>
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isSelected 
                              ? 'bg-brand-500/15 border-brand-500/40 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/20 font-bold' 
                              : 'bg-slate-100/80 dark:bg-[#161f28]/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Geplantes Budget (€)
                  </label>
                  <input 
                    value={budget} 
                    onChange={e => updateForm({ budget: e.target.value ? Number(e.target.value) : "" })} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tatsächliche Kosten (€)
                  </label>
                  <input 
                    value={cost} 
                    onChange={e => updateForm({ cost: e.target.value ? Number(e.target.value) : "" })} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Notizen / Links
                </label>
                <textarea 
                  value={notes} 
                  onChange={e => updateForm({ notes: e.target.value })} 
                  rows={3} 
                  placeholder="Hotel-Links, Adressen, Packlisten, Buchungsnummern..." 
                  className="bg-white dark:bg-[#070c12]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none resize-none"
                />
              </div>
            </section>

          </form>
        </div>

        {/* Footer Actions (TripModal Standard) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-between shrink-0">
          {trip ? (
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> 
              <span>Löschen</span>
            </button>
          ) : <div />}
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer text-sm"
            >
              Abbrechen
            </button>
            <button 
              type="submit"
              form="trip-form"
              disabled={isSaving || selectedProfileIds.length === 0}
              className="px-6 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> 
              <span>{isSaving ? "Speichert..." : "Speichern"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

