"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { isVacationCostingDay, calculateTripVacationCost } from "@/lib/tripUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

export default function VacationBurnDownWidget() {
  const selectedYear = useStore(state => state.selectedYear)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const holidays = useStore(state => state.holidays)
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const overrides = useStore(state => state.overrides)

  const activeProfile = profiles.find(p => p.id === activeProfileIds[0])

  const data = useMemo(() => {
    if (!activeProfile) return []

    const stats = getProfileStatsForYear(activeProfile, selectedYear, overrides, entries, trips, holidays)
    let currentBalance = stats ? stats.totalAvailable : 0

    const monthlyData = []

    for (let month = 0; month < 12; month++) {
      // Calculate leave taken IN THIS MONTH
      let monthTaken = 0

      // 1. Manual Entries
      entries.forEach(e => {
        if (e.profileId !== activeProfile.id) return
        const d = new Date(e.date)
        if (d.getFullYear() === selectedYear && d.getMonth() === month) {
          if (isVacationCostingDay(e.date, activeProfile, holidays)) {
            e.type.split(',').forEach(part => {
              if (part === 'U') monthTaken += 1
              if (part === '2') monthTaken += 0.5
            })
          }
        }
      })

      // 2. Trips
      // To be precise per month, we check every day of the trip
      trips.forEach(t => {
        if (!t.profiles.some(p => p.id === activeProfile.id)) return
        
        const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
        const noCostTypes = ["Sabbatical", "Sonderurlaub", "Mobiles Arbeiten", "Überstundenabbau", "Krankheit"]
        if (!validTripStatuses.includes(t.status)) return
        if (noCostTypes.includes(t.type)) return

        const start = new Date(t.startDate)
        const end = new Date(t.endDate)
        
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          if (d.getUTCFullYear() === selectedYear && d.getUTCMonth() === month) {
            const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
            if (isVacationCostingDay(dateStr, activeProfile, holidays)) {
              monthTaken += 1
            }
          }
        }
      })

      currentBalance -= monthTaken
      monthlyData.push({
        month: MONTHS[month],
        resturlaub: currentBalance
      })
    }

    // Add a Start point at Jan 1st
    return [
      { month: 'Start', resturlaub: stats ? stats.totalAvailable : 0 },
      ...monthlyData
    ]
  }, [selectedYear, entries, trips, holidays, activeProfile, overrides])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full w-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Urlaubs-Guthaben Verlauf</h3>
      <p className="text-xs text-slate-500 mb-6">Wie schnell verbrauchst du deinen Urlaub im Jahr {selectedYear}?</p>
      
      {data.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center flex-1 flex items-center justify-center">Kein aktives Profil gewählt.</div>
      ) : (
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorResturlaub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="resturlaub" name="Resturlaub" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResturlaub)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
