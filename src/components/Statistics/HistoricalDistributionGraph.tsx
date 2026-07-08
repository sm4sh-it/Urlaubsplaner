"use client"

import { useStore } from "@/store/useStore"
import { useState, useMemo } from "react"
import { SHORT_MONTHS } from "@/lib/dateUtils"
import { isVacationCostingDay } from "@/lib/tripUtils"
import { CalendarDays, Pill } from "lucide-react"

export default function HistoricalDistributionGraph() {
  const [viewMode, setViewMode] = useState<'Urlaub' | 'Krankheit'>('Urlaub')
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const profiles = useStore(state => state.profiles)
  const holidays = useStore(state => state.holidays)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  // Use the first active profile
  const activeProfile = profiles.find(p => p.id === activeProfileIds[0])

  const { levels, quantileThresholds } = useMemo(() => {
    if (!activeProfile) return { levels: new Map<string, number>(), quantileThresholds: [] }

    // Use a Set of YYYY-MM-DD to avoid double counting
    const uniqueDates = new Set<string>()

    // 1. Process Manual Entries
    entries.forEach(e => {
      if (e.profileId !== activeProfile.id) return
      if (viewMode === 'Urlaub' && (e.type === 'U' || e.type === '2')) {
        if (isVacationCostingDay(e.date, activeProfile, holidays)) {
          uniqueDates.add(e.date)
        }
      } else if (viewMode === 'Krankheit' && (e.type === 'K' || e.type === '3')) {
        // Sickness counts on any day it is entered
        uniqueDates.add(e.date)
      }
    })

    // 2. Process Trips (Only for Vacation)
    if (viewMode === 'Urlaub') {
      const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
      const validTypes = ["Urlaub", "Sonderurlaub", "Sabbatical", "Überstundenabbau", "Wanderurlaub", "Städtetrip", "Strandurlaub", "Heimatbesuch", "Rundreise", "Skiurlaub", "Wellness", "Roadtrip", "Aktivurlaub", "Kombi-Reise"]
      
      trips.forEach(t => {
        if (!validTripStatuses.includes(t.status)) return
        if (!validTypes.includes(t.type)) return
        if (!t.profiles.some(p => p.id === activeProfile.id)) return

        const start = new Date(t.startDate)
        const end = new Date(t.endDate)
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          if (isVacationCostingDay(dateStr, activeProfile, holidays)) {
            uniqueDates.add(dateStr)
          }
        }
      })
    }

    // Accumulate frequencies per day of year (MM-DD)
    const frequencies = new Map<string, number>()
    uniqueDates.forEach(dateStr => {
      const mmdd = dateStr.substring(5) // Extract MM-DD
      frequencies.set(mmdd, (frequencies.get(mmdd) || 0) + 1)
    })

    // Calculate Percentiles
    const values = Array.from(frequencies.values()).sort((a, b) => a - b)
    
    // Fallback if no data
    if (values.length === 0) {
      return { levels: new Map<string, number>(), quantileThresholds: [0, 0, 0, 0] }
    }

    const getQuantile = (q: number) => {
      const pos = (values.length - 1) * q
      const base = Math.floor(pos)
      const rest = pos - base
      if (values[base + 1] !== undefined) {
        return values[base] + rest * (values[base + 1] - values[base])
      } else {
        return values[base]
      }
    }

    const q25 = getQuantile(0.25)
    const q50 = getQuantile(0.50)
    const q75 = getQuantile(0.75)
    const q100 = values[values.length - 1]

    const quantileThresholds = [q25, q50, q75, q100]

    // Assign level 1 to 4
    const levelsMap = new Map<string, number>()
    frequencies.forEach((count, mmdd) => {
      if (count === 0) {
        levelsMap.set(mmdd, 0)
      } else if (count <= q25) {
        levelsMap.set(mmdd, 1)
      } else if (count <= q50) {
        levelsMap.set(mmdd, 2)
      } else if (count <= q75) {
        levelsMap.set(mmdd, 3)
      } else {
        levelsMap.set(mmdd, 4)
      }
    })

    return { levels: levelsMap, quantileThresholds }
  }, [entries, trips, viewMode, activeProfile, holidays])

  if (!activeProfile) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 flex flex-col min-h-[400px]">
        <div className="text-slate-400">Bitte wähle ein Profil aus.</div>
      </div>
    )
  }

  // Generate grid for rendering: 12 Columns (Months), 31 Rows (Days)
  // We'll iterate by columns for each month, and then rows for each day.
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  
  const getLevelClass = (level: number) => {
    if (level === 0) return 'bg-[#2d333b]' // Base empty color GitHub dark style
    if (viewMode === 'Urlaub') {
      return `vacation-${level}`
    } else {
      return `sick-${level}`
    }
  }

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl overflow-hidden w-full h-full">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex bg-[#161b22] rounded-full p-1 border border-slate-700/50">
          <button
            onClick={() => setViewMode('Urlaub')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              viewMode === 'Urlaub' 
                ? 'bg-[#238636] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Urlaub
          </button>
          <button
            onClick={() => setViewMode('Krankheit')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              viewMode === 'Krankheit' 
                ? 'bg-[#da3633] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" /> Krankheit
          </button>
        </div>
        
        <h2 className="text-xl font-bold text-slate-100 text-center min-w-[360px]">
          {viewMode === 'Urlaub' ? 'Urlaubsverteilung über die Jahre' : 'Krankheitsverteilung über die Jahre'}
        </h2>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          <div className="flex gap-2 mb-2">
            {SHORT_MONTHS.map((m, i) => (
              <div key={i} className="text-[10px] text-slate-500 font-medium uppercase text-center w-5">
                {m}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {SHORT_MONTHS.map((_, mIdx) => (
              <div key={mIdx} className="flex flex-col gap-1 w-5">
                {Array.from({ length: 31 }).map((_, dIdx) => {
                  const day = dIdx + 1
                  const maxDays = daysInMonth[mIdx]
                  if (day > maxDays) {
                    return <div key={dIdx} className="w-5 h-5 rounded-sm invisible" />
                  }
                  
                  const mmdd = `${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const level = levels.get(mmdd) || 0
                  
                  return (
                    <div 
                      key={dIdx} 
                      className={`w-5 h-5 rounded-sm transition-colors duration-300 ${getLevelClass(level)}`} 
                      title={`${day}. ${SHORT_MONTHS[mIdx]}: ${levels.has(mmdd) ? levels.get(mmdd) : 0} Einträge (Level ${level})`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <span>Selten {viewMode === 'Urlaub' ? 'Urlaub' : 'Krank'}</span>
        <div className="flex gap-1 ml-2 mr-2">
          <div className="w-4 h-4 rounded-sm bg-[#2d333b]" />
          <div className={`w-4 h-4 rounded-sm ${viewMode === 'Urlaub' ? 'vacation-1' : 'sick-1'}`} />
          <div className={`w-4 h-4 rounded-sm ${viewMode === 'Urlaub' ? 'vacation-2' : 'sick-2'}`} />
          <div className={`w-4 h-4 rounded-sm ${viewMode === 'Urlaub' ? 'vacation-3' : 'sick-3'}`} />
          <div className={`w-4 h-4 rounded-sm ${viewMode === 'Urlaub' ? 'vacation-4' : 'sick-4'}`} />
        </div>
        <span>Häufig {viewMode === 'Urlaub' ? 'Urlaub' : 'Krank'}</span>
      </div>
    </div>
  )
}
