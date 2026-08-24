"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useStore } from "@/store/useStore"
import { Trip } from "@/types"
import TripCard from "./TripCard"
import TripModal from "./TripModal"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { calculateTripVacationCost, isVacationCostingDay, tripOverlapsYear } from "@/lib/tripUtils"
import { Plus, ArrowRight } from "lucide-react"
import YearlyContributionGraph from "./YearlyContributionGraph"
import EmptyState from "@/components/ui/EmptyState"
import AvatarGroup from "@/components/ui/AvatarGroup"

export default function DashboardHome() {
  const trips = useStore(state => state.trips)
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const entries = useStore(state => state.entries)
  const overrides = useStore(state => state.overrides)
  const holidays = useStore(state => state.holidays)
  const selectedYear = useStore(state => state.selectedYear)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const handleOpenNew = () => {
    setSelectedTrip(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  // Active trips for selected profiles
  const { upcomingTrips, pastTripsSelectedYear, totalArchivedCount } = useMemo(() => {
    const active = trips.filter(trip => 
      trip.profiles.some(p => activeProfileIds.includes(p.id))
    )
    const todayStr = new Date().toISOString().split('T')[0]
    
    const upcoming = active.filter(t => t.endDate >= todayStr)
    const allArchived = active.filter(t => t.endDate < todayStr)
    
    // For Dashboard: only show past trips belonging to selectedYear
    const pastThisYear = allArchived
      .filter(t => tripOverlapsYear(t, selectedYear))
      .sort((a, b) => b.endDate.localeCompare(a.endDate))

    upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate))

    return { 
      upcomingTrips: upcoming, 
      pastTripsSelectedYear: pastThisYear,
      totalArchivedCount: allArchived.length
    }
  }, [trips, activeProfileIds, selectedYear])

  const { totalRemainingLeave, totalAnnualLeave } = useMemo(() => {
    let remaining = 0
    let annual = 0
    
    activeProfileIds.forEach(id => {
      const p = profiles.find(p => p.id === id)
      if (p) {
        const stats = getProfileStatsForYear(p, selectedYear, overrides, entries, trips, holidays)
        if (stats) {
          annual += stats.totalAvailable
          
          let standardTaken = 0
          const yearEntries = entries.filter(e => e.profileId === id && e.date.startsWith(selectedYear.toString()))
          yearEntries.forEach(e => {
            if (isVacationCostingDay(e.date, p, holidays)) {
              e.type.split(',').forEach(part => {
                if (part === 'U') standardTaken += 1
                if (part === '2') standardTaken += 0.5
              })
            }
          })

          let tripTaken = 0
          const profileTrips = trips.filter(t => t.profiles.some(pt => pt.id === id) && tripOverlapsYear(t, selectedYear))
          profileTrips.forEach(t => {
            tripTaken += calculateTripVacationCost(t, p, holidays, selectedYear)
          })

          remaining += (stats.totalAvailable - standardTaken - tripTaken)
        }
      }
    })
    return { totalRemainingLeave: remaining, totalAnnualLeave: annual }
  }, [activeProfileIds, profiles, selectedYear, overrides, entries, trips, holidays])

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6 md:gap-8">
      
      {/* Stats Row / Header */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 pb-2 sm:pb-4 font-medium">
        <span className="font-bold text-slate-700 dark:text-slate-200 text-lg sm:text-xl tracking-tight">
          {selectedYear}
        </span>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 hidden sm:block" />
        <span className="flex items-center gap-1.5">
          Gesamturlaub <strong className="font-bold text-slate-700 dark:text-slate-200">{totalRemainingLeave} / {totalAnnualLeave}</strong>
        </span>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 hidden sm:block" />
        <span className="flex items-center gap-1.5">
          Geplante Reisen <strong className="font-bold text-slate-700 dark:text-slate-200">{upcomingTrips.length}</strong>
        </span>
      </div>

      <YearlyContributionGraph />

      {/* Active Trips Section */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200">
            Anstehende Reisen & Urlaube
          </h2>
          <button 
            onClick={handleOpenNew}
            className="btn-glass inline-flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-200"
          >
            <Plus className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Neue Reise</span>
          </button>
        </div>

        {upcomingTrips.length === 0 ? (
          <EmptyState
            variant="card"
            title="Noch keine Reisen geplant"
            description="Erstelle deine erste Urlaubsreise oder Kurztrips, um Budgets und freie Tage automatisch zu berechnen."
            actionLabel="Neue Reise anlegen"
            onAction={handleOpenNew}
          />
        ) : (
          <div className="vacation-grid">
            {upcomingTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onClick={() => handleOpenEdit(trip)} />
            ))}
          </div>
        )}
      </div>

      {/* Past Trips of Selected Year */}
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span>Vergangene Reisen</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#161f28] text-slate-500 dark:text-slate-400 font-mono font-bold">
                {selectedYear}
              </span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {pastTripsSelectedYear.length === 1
                ? "1 abgeschlossene Reise in diesem Jahr"
                : `${pastTripsSelectedYear.length} abgeschlossene Reisen in diesem Jahr`}
            </p>
          </div>

          <Link
            href="/archive"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors self-start sm:self-auto"
          >
            <span>Zum vollständigen Archiv ({totalArchivedCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pastTripsSelectedYear.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Bislang keine vergangenen Reisen im Jahr {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Reise</th>
                  <th className="py-3 px-3 font-semibold">Zeitraum</th>
                  <th className="py-3 px-3 font-semibold">Dauer</th>
                  <th className="py-3 px-3 font-semibold hidden md:table-cell">Ort / Land</th>
                  <th className="py-3 px-3 font-semibold hidden sm:table-cell">Typ</th>
                  <th className="py-3 px-3 font-semibold">Teilnehmer</th>
                  <th className="py-3 px-3 font-semibold text-right">Kosten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {pastTripsSelectedYear.map(trip => {
                  const start = new Date(trip.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  const end = new Date(trip.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  const locationText = [trip.location, trip.country].filter(Boolean).join(", ")
                  const tripProfiles = (trip.profiles || [])
                    .map(pRef => profiles.find(p => p.id === pRef.id))
                    .filter(Boolean) as { id: string; name: string; color: string }[]

                  return (
                    <tr 
                      key={trip.id} 
                      onClick={() => handleOpenEdit(trip)}
                      className="hover:bg-slate-50 dark:hover:bg-brand-500/[0.04] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                        {trip.title}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                        {start} – {end}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-xs font-semibold">
                        {trip.isHalfDay ? (trip.duration === 1 ? "0.5 Tag" : `${trip.duration * 0.5} Tage`) : `${trip.duration} Tage`}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {locationText || "—"}
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#161f28] text-slate-600 dark:text-slate-300">
                          {trip.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <AvatarGroup profiles={tripProfiles} size="xs" max={3} />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {trip.cost != null && trip.cost > 0 ? `${trip.cost.toFixed(2)} €` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TripModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={selectedTrip}
      />
    </div>
  )
}
