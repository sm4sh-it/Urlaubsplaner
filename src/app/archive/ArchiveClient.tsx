"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/store/useStore"
import { Trip } from "@/types"
import TripModal from "@/components/Dashboard/TripModal"
import {
  Archive,
  Search,
  ChevronDown,
  Edit3,
} from "lucide-react"
import AvatarGroup from "@/components/ui/AvatarGroup"
import EmptyState from "@/components/ui/EmptyState"

export default function ArchiveClient() {
  const trips = useStore((state) => state.trips)
  const profiles = useStore((state) => state.profiles) || []

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL")
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<string>("ALL")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL")

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  // All past trips
  const todayStr = new Date().toISOString().split("T")[0]
  const allPastTrips = useMemo(() => {
    return trips
      .filter((t) => t.endDate < todayStr)
      .sort((a, b) => b.endDate.localeCompare(a.endDate))
  }, [trips, todayStr])

  // Extract available years from past trips
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>()
    allPastTrips.forEach((t) => {
      if (t.startDate) yearsSet.add(t.startDate.substring(0, 4))
      if (t.endDate) yearsSet.add(t.endDate.substring(0, 4))
    })
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
  }, [allPastTrips])

  // Extract available trip types
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>()
    allPastTrips.forEach((t) => {
      if (t.type) typesSet.add(t.type)
      if (t.travelType) typesSet.add(t.travelType)
    })
    return Array.from(typesSet).sort((a, b) => a.localeCompare(b, "de"))
  }, [allPastTrips])

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return allPastTrips.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchLoc = (t.location || "").toLowerCase().includes(q)
        const matchCountry = (t.country || "").toLowerCase().includes(q)
        const matchNotes = (t.notes || "").toLowerCase().includes(q)
        const matchType = (t.type || "").toLowerCase().includes(q)
        const matchTravelType = (t.travelType || "").toLowerCase().includes(q)
        if (!matchTitle && !matchLoc && !matchCountry && !matchNotes && !matchType && !matchTravelType) {
          return false
        }
      }

      // 2. Year Filter
      if (selectedYearFilter !== "ALL") {
        const matchesStart = t.startDate && t.startDate.startsWith(selectedYearFilter)
        const matchesEnd = t.endDate && t.endDate.startsWith(selectedYearFilter)
        if (!matchesStart && !matchesEnd) return false
      }

      // 3. Profile Filter
      if (selectedProfileFilter !== "ALL") {
        const hasProfile = t.profiles.some((p) => p.id === selectedProfileFilter)
        if (!hasProfile) return false
      }

      // 4. Type Filter
      if (selectedTypeFilter !== "ALL") {
        if (t.type !== selectedTypeFilter && t.travelType !== selectedTypeFilter) {
          return false
        }
      }

      return true
    })
  }, [allPastTrips, searchQuery, selectedYearFilter, selectedProfileFilter, selectedTypeFilter])

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Reise-Archiv
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Übersicht und Historie aller vergangenen Reisen und Urlaube
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161f28] text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono">
            {filteredTrips.length} von {allPastTrips.length} {allPastTrips.length === 1 ? "Reise" : "Reisen"}
          </span>
        </div>
      </div>

      {/* Filter Bar (Sub-Well Standard aus Design.md Sektion 5.4) */}
      <div className="bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Reise, Ort, Land oder Notizen durchsuchen..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#070c12]/70 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Dropdown Filters with Custom Chevron */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#070c12]/70 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:focus:border-brand-500 outline-none cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-white dark:bg-[#0d141d]">Alle Jahre</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-[#0d141d]">
                  Jahr {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Profile Filter */}
          <div className="relative">
            <select
              value={selectedProfileFilter}
              onChange={(e) => setSelectedProfileFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#070c12]/70 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:focus:border-brand-500 outline-none cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-white dark:bg-[#0d141d]">Alle Profile</option>
              {profiles.filter(p => p.id !== 'ALLE_FERIEN').map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[#0d141d]">
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Filter */}
          {availableTypes.length > 0 && (
            <div className="relative">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#070c12]/70 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:focus:border-brand-500 outline-none cursor-pointer transition-all"
              >
                <option value="ALL" className="bg-white dark:bg-[#0d141d]">Alle Reisetypen</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-[#0d141d]">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Clear Filters */}
          {(searchQuery || selectedYearFilter !== "ALL" || selectedProfileFilter !== "ALL" || selectedTypeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedYearFilter("ALL")
                setSelectedProfileFilter("ALL")
                setSelectedTypeFilter("ALL")
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Main Table / List (Midnight Glass Container Standard) */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-sm">
        {filteredTrips.length === 0 ? (
          <EmptyState
            variant={searchQuery || selectedYearFilter !== "ALL" || selectedProfileFilter !== "ALL" || selectedTypeFilter !== "ALL" ? "subwell" : "card"}
            icon={Archive}
            title={allPastTrips.length === 0 ? "Keine archivierten Reisen vorhanden" : "Keine passenden Reisen gefunden"}
            description={
              allPastTrips.length === 0
                ? "Sobald geplante Reisen in der Vergangenheit liegen, erscheinen sie automatisch hier im Archiv."
                : "Passe deine Filterkriterien für Suche, Jahr oder Profil an."
            }
            actionLabel={
              searchQuery || selectedYearFilter !== "ALL" || selectedProfileFilter !== "ALL" || selectedTypeFilter !== "ALL"
                ? "Filter zurücksetzen"
                : undefined
            }
            onAction={() => {
              setSearchQuery("")
              setSelectedYearFilter("ALL")
              setSelectedProfileFilter("ALL")
              setSelectedTypeFilter("ALL")
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Reise</th>
                  <th className="py-3 px-3 font-semibold">Land / Ort</th>
                  <th className="py-3 px-3 font-semibold">Zeitraum &amp; Dauer</th>
                  <th className="py-3 px-3 font-semibold hidden md:table-cell">Typ &amp; Transport</th>
                  <th className="py-3 px-3 font-semibold">Teilnehmer</th>
                  <th className="py-3 px-3 font-semibold text-right">Kosten</th>
                  <th className="py-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTrips.map((trip) => {
                  const start = new Date(trip.startDate).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  const end = new Date(trip.endDate).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })

                  const tripProfiles = (trip.profiles || [])
                    .map((tp) => profiles.find((p) => p.id === tp.id))
                    .filter(Boolean) as { id: string; name: string; color: string }[]

                  return (
                    <tr
                      key={trip.id}
                      onClick={() => handleOpenEdit(trip)}
                      className="hover:bg-slate-50 dark:hover:bg-brand-500/[0.04] cursor-pointer transition-colors group"
                    >
                      {/* Title & Notes */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {trip.title}
                        </div>
                        {trip.notes && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 max-w-[240px] mt-0.5">
                            {trip.notes}
                          </div>
                        )}
                      </td>

                      {/* Land & Ort */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          {trip.country && (
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {trip.country}
                            </span>
                          )}
                          {trip.location && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                              {trip.location}
                            </span>
                          )}
                          {!trip.country && !trip.location && (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Zeitraum & Dauer */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {start} – {end}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {trip.isHalfDay
                            ? trip.duration === 1
                              ? "0.5 Tag"
                              : `${trip.duration * 0.5} Tage`
                            : `${trip.duration} ${trip.duration === 1 ? "Tag" : "Tage"}`}
                        </div>
                      </td>

                      {/* Typ & Transport */}
                      <td className="py-3.5 px-3 hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#161f28] text-slate-600 dark:text-slate-300">
                            {trip.travelType || trip.type}
                          </span>
                          {trip.transport && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-[#161f28] text-slate-500 dark:text-slate-400"
                              title={`Transportmittel: ${trip.transport}`}
                            >
                              {trip.transport}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Teilnehmer */}
                      <td className="py-3.5 px-3">
                        <AvatarGroup profiles={tripProfiles} size="xs" max={3} />
                      </td>

                      {/* Kosten */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-100">
                          {trip.cost != null && trip.cost > 0 ? `${trip.cost.toFixed(2)} €` : "—"}
                        </div>
                        {trip.budget != null && trip.budget > 0 && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Limit: {trip.budget.toFixed(0)} €
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(trip)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Reise ansehen / bearbeiten"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} trip={selectedTrip} />
    </div>
  )
}
