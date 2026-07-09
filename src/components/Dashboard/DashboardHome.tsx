"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/store/useStore"
import { Trip } from "@/types"
import TripCard from "./TripCard"
import TripModal from "./TripModal"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { calculateTripVacationCost, isVacationCostingDay } from "@/lib/tripUtils"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import YearlyContributionGraph from "./YearlyContributionGraph"

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
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)

  const handleOpenNew = () => {
    setSelectedTrip(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  const { upcomingTrips, archivedTrips } = useMemo(() => {
    const active = trips.filter(trip => 
      trip.profiles.some(p => activeProfileIds.includes(p.id))
    )
    const todayStr = new Date().toISOString().split('T')[0]
    const upcoming = active.filter(t => t.endDate >= todayStr)
    const archived = active.filter(t => t.endDate < todayStr)
    upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate))
    archived.sort((a, b) => b.endDate.localeCompare(a.endDate))
    return { upcomingTrips: upcoming, archivedTrips: archived }
  }, [trips, activeProfileIds])

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
              if (e.type === 'U') standardTaken += 1
              if (e.type === '2') standardTaken += 0.5
            }
          })

          let tripTaken = 0
          const profileTrips = trips.filter(t => t.profiles.some(pt => pt.id === id) && t.startDate.startsWith(selectedYear.toString()))
          profileTrips.forEach(t => {
            tripTaken += calculateTripVacationCost(t, p, holidays)
          })

          remaining += (stats.totalAvailable - standardTaken - tripTaken)
        }
      }
    })
    return { totalRemainingLeave: remaining, totalAnnualLeave: annual }
  }, [activeProfileIds, profiles, selectedYear, overrides, entries, trips, holidays])

  // Count sickness days in selected year (removed from display as requested)
  // const sicknessDays = ...

  return (
    <div className="max-w-[1600px] w-full mx-auto p-6 md:p-10 flex flex-col gap-10">
      
      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-lg text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-[var(--border-subtle)] pb-6 font-medium">
        <span className="font-bold text-slate-800 dark:text-slate-100">{selectedYear}</span>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
        <span className="flex items-center gap-2">
          Gesamturlaub <strong className="text-slate-800 dark:text-slate-100">{totalRemainingLeave} / {totalAnnualLeave}</strong>
        </span>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
        <span className="flex items-center gap-2">
          Geplante Reisen <strong className="text-slate-800 dark:text-slate-100">{upcomingTrips.length}</strong>
        </span>
      </div>

      <YearlyContributionGraph />

      {/* Active Trips */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full inline-block"></span>
            Anstehende Reisen & Urlaube
          </h2>
          <button 
            onClick={handleOpenNew}
            className="flex items-center gap-2 border border-slate-300 dark:border-[var(--border)] text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer bg-white/50 dark:bg-black/20"
          >
            <Plus className="w-4 h-4" /> Neue Reise
          </button>
        </div>

        {upcomingTrips.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500">
            Aktuell sind keine Reisen geplant.
          </div>
        ) : (
          <div className="vacation-grid">
            {upcomingTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onClick={() => handleOpenEdit(trip)} />
            ))}
          </div>
        )}
      </div>

      {/* Archive Section */}
      {archivedTrips.length > 0 && (
        <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-8">
          <button 
            onClick={() => setIsArchiveOpen(!isArchiveOpen)}
            className="flex justify-between items-center w-full text-left text-xl font-bold text-slate-800 dark:text-slate-100 hover:text-brand-500 transition-colors"
          >
            Archivierte & Vergangene Urlaube
            {isArchiveOpen ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
          </button>

          {isArchiveOpen && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 font-medium text-slate-500">Titel</th>
                    <th className="py-3 px-4 font-medium text-slate-500">Zeitraum</th>
                    <th className="py-3 px-4 font-medium text-slate-500">Dauer</th>
                    <th className="py-3 px-4 font-medium text-slate-500">Typ</th>
                    <th className="py-3 px-4 font-medium text-slate-500">Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedTrips.map(trip => {
                    const start = new Date(trip.startDate).toLocaleDateString('de-DE')
                    const end = new Date(trip.endDate).toLocaleDateString('de-DE')
                    return (
                      <tr 
                        key={trip.id} 
                        onClick={() => handleOpenEdit(trip)}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{trip.title}</td>
                        <td className="py-4 px-4">{start} - {end}</td>
                        <td className="py-4 px-4">{trip.duration} Tage</td>
                        <td className="py-4 px-4">{trip.type}</td>
                        <td className="py-4 px-4">{trip.cost ? `€${trip.cost.toFixed(2)}` : '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <TripModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={selectedTrip}
      />
    </div>
  )
}
