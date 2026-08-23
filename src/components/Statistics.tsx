"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/store/useStore"
import { SHORT_MONTHS } from "@/lib/dateUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { isVacationCostingDay, calculateTripVacationCost, tripOverlapsYear } from "@/lib/tripUtils"
import { calculateHolidayEfficiency } from "@/lib/statisticsUtils"
import { ChevronUp, ChevronDown } from "lucide-react"

export default function Statistics() {
  const activeSidebarPanel = useStore(state => state.activeSidebarPanel)
  const setActiveSidebarPanel = useStore(state => state.setActiveSidebarPanel)
  const isOpen = activeSidebarPanel === 'statistics'
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const entries = useStore(state => state.entries)
  const overrides = useStore(state => state.overrides)
  const trips = useStore(state => state.trips)
  const holidays = useStore(state => state.holidays)
  const selectedYear = useStore(state => state.selectedYear)

  const activeProfile = activeProfileIds.length > 0 ? profiles.find(p => p.id === activeProfileIds[0]) : undefined

  const stats = activeProfile ? getProfileStatsForYear(activeProfile, selectedYear, overrides, entries, trips, holidays) : null
  
  const { totalUrlaub, totalKrank, totalMobile, monthlyStats, ungenutzterResturlaub, efficiencyData } = useMemo(() => {
    if (!activeProfile) return { totalUrlaub: 0, totalKrank: 0, totalMobile: 0, monthlyStats: [], ungenutzterResturlaub: 0, efficiencyData: null }

    // Filtern der Einträge für dieses Jahr und Profil
    const yearEntries = entries.filter(e => 
      e.profileId === activeProfile.id && e.date.startsWith(selectedYear.toString())
    )

    let tUrlaub = 0
    let tKrank = 0
    let tMobile = 0
    const mStats = Array(12).fill(0).map(() => ({ urlaub: 0, krank: 0, mobile: 0 }))

    yearEntries.forEach(entry => {
      const month = parseInt(entry.date.split('-')[1]) - 1 // 0-11
      
      let urlaubVal = 0
      let krankVal = 0
      let mobileVal = 0

      entry.type.split(',').forEach(part => {
        if (isVacationCostingDay(entry.date, activeProfile, holidays)) {
          if (part === 'U') urlaubVal += 1
          if (part === '2') urlaubVal += 0.5
        }
        if (part === 'K') krankVal += 1
        if (part === '3') krankVal += 0.5
        if (part === 'M') mobileVal += 1
        if (part === '5') mobileVal += 0.5
      })

      tUrlaub += urlaubVal
      tKrank += krankVal
      tMobile += mobileVal
      
      if (month >= 0 && month < 12) {
        mStats[month].urlaub += urlaubVal
        mStats[month].krank += krankVal
        mStats[month].mobile += mobileVal
      }
    })

    // Trips einberechnen
    const yearTrips = trips.filter(t => t.profiles.some(p => p.id === activeProfile.id) && tripOverlapsYear(t, selectedYear))
    
    yearTrips.forEach(trip => {
      if (!["In Planung", "Gebucht", "Abgeschlossen"].includes(trip.status)) return

      if (trip.type === "Urlaub") {
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        const dayCost = trip.isHalfDay ? 0.5 : 1
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          if (d.getUTCFullYear() !== selectedYear) continue;
          
          const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0')
          const dayStr = String(d.getUTCDate()).padStart(2, '0')
          const dateStr = `${d.getUTCFullYear()}-${monthStr}-${dayStr}`
          
          if (isVacationCostingDay(dateStr, activeProfile, holidays)) {
            tUrlaub += dayCost
            const m = d.getUTCMonth()
            if (m >= 0 && m < 12) mStats[m].urlaub += dayCost
          }
        }
      }

      if (trip.type === "Mobiles Arbeiten") {
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        const dayCost = trip.isHalfDay ? 0.5 : 1
        const workingDays = activeProfile.workingDays ? activeProfile.workingDays.split(',').map(Number) : [1, 2, 3, 4, 5]
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          if (d.getUTCFullYear() !== selectedYear) continue;
          
          let dow = d.getUTCDay()
          if (dow === 0) dow = 7
          const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0')
          const dayStr = String(d.getUTCDate()).padStart(2, '0')
          const dateStr = `${d.getUTCFullYear()}-${monthStr}-${dayStr}`
          
          if (workingDays.includes(dow) && !holidays[dateStr]) {
            tMobile += dayCost
            const m = d.getUTCMonth()
            if (m >= 0 && m < 12) mStats[m].mobile += dayCost
          }
        }
      }
    })

    // Logik für Resturlaubs-Warnung
    // Wie viele Urlaubstage wurden VOR dem Verfallsdatum genommen?
    const expiryDateString = `${selectedYear}-${activeProfile.remainingLeaveExpiryDate}`
    let urlaubVorVerfall = 0
    yearEntries.forEach(e => {
      if (e.date <= expiryDateString) {
        if (isVacationCostingDay(e.date, activeProfile, holidays)) {
          e.type.split(',').forEach(part => {
            if (part === 'U') urlaubVorVerfall += 1
            if (part === '2') urlaubVorVerfall += 0.5
          })
        }
      }
    })

    // Berücksichtige auch Urlaubstage, die durch Reisen vor dem Verfallsdatum genommen werden
    const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
    const validTypes = ["Urlaub"]
    
    const profileTrips = trips.filter(t => t.profiles.some(p => p.id === activeProfile.id))
    
    profileTrips.forEach(t => {
      if (validTripStatuses.includes(t.status) && validTypes.includes(t.type)) {
        const start = new Date(t.startDate)
        const end = new Date(t.endDate)
        
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          const year = d.getUTCFullYear()
          if (year !== selectedYear) continue;
          const month = String(d.getUTCMonth() + 1).padStart(2, '0')
          const day = String(d.getUTCDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          if (dateStr <= expiryDateString) {
            if (isVacationCostingDay(dateStr, activeProfile, holidays)) {
              urlaubVorVerfall += 1
            }
          }
        }
      }
    })

    const ungenutzterResturlaubCalc = Math.max(0, (stats?.remainingLeave || 0) - urlaubVorVerfall)

    const efficiencyData = calculateHolidayEfficiency(selectedYear, activeProfile, entries, trips, holidays)

    return { totalUrlaub: tUrlaub, totalKrank: tKrank, totalMobile: tMobile, monthlyStats: mStats, ungenutzterResturlaub: ungenutzterResturlaubCalc, efficiencyData }
  }, [entries, activeProfile, selectedYear, holidays, trips, stats?.remainingLeave])

  if (activeProfileIds.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-sm flex flex-col min-h-0 shrink-0">
        <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-2">Statistik</h2>
        <div className="text-xs text-slate-400 dark:text-slate-500">Bitte wähle ein Profil aus.</div>
      </div>
    )
  }

  if (!activeProfile) return null

  if (!stats) {
    return (
      <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-sm flex flex-col min-h-0 shrink-0">
        <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-2">Statistik ({activeProfile.name})</h2>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Profil ist für das Jahr {selectedYear} nicht aktiv (Startjahr: {activeProfile.startYear}).
        </div>
      </div>
    )
  }

  const verfuegbar = stats.totalAvailable
  const restUrlaubAktuell = verfuegbar - totalUrlaub

  return (
    <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-sm flex flex-col min-h-[56px] shrink-0">
      <div 
        className="flex items-center justify-between cursor-pointer group min-h-[40px] py-1 shrink-0 select-none"
        onClick={() => setActiveSidebarPanel(isOpen ? 'legend' : 'statistics')}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">
            Statistik
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold truncate max-w-[120px]">
            {activeProfile.name}
          </span>
        </div>
        <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <>
          {activeProfile.remainingLeave > 0 && (
            <div className={`mt-3 mb-2 text-xs p-3 rounded-xl border flex items-start gap-2 ${
              ungenutzterResturlaub > 0 
                ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20" 
                : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
            }`}>
              {ungenutzterResturlaub > 0 ? (
                <span><strong>Achtung:</strong> Plane noch <strong>{ungenutzterResturlaub}</strong> weitere Tage bis zum <strong>{activeProfile.remainingLeaveExpiryDate.split('-').reverse().join('.')}</strong>, um keinen Resturlaub zu verlieren.</span>
              ) : (
                <span><strong>Super:</strong> Dein kompletter Resturlaub ist bis zum Stichtag sicher eingeplant!</span>
              )}
            </div>
          )}
          
          <div className="space-y-3 mt-3 mb-4 shrink-0">
            <div className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Anspruch:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{verfuegbar} Tage</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Genommen:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{totalUrlaub} Tage</span>
              </div>
              
              <div className="flex justify-between items-center font-semibold border-t border-slate-200/80 dark:border-white/10 pt-2 text-slate-700 dark:text-slate-200 text-sm">
                <span>Rest gesamt:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{restUrlaubAktuell} Tage</span>
              </div>
              
              {ungenutzterResturlaub > 0 && (
                <>
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 pt-1 text-[11px]">
                    <span>Davon verfallen am Stichtag:</span>
                    <span className="font-mono font-bold">-{ungenutzterResturlaub} Tage</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200/80 dark:border-white/10 text-[11px] font-semibold">
                    <span>Übertrag ins nächste Jahr:</span>
                    <span className="font-mono font-bold">{Math.max(0, restUrlaubAktuell - ungenutzterResturlaub)} Tage</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Krankheitstage:
                </span>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{totalKrank} Tage</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Mobiles Arbeiten:
                </span>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{totalMobile} Tage</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            <h3 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Pro Monat
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 text-xs max-h-48 custom-scrollbar">
              {SHORT_MONTHS.map((month, i) => {
                const stats = monthlyStats[i]
                if (stats.urlaub === 0 && stats.krank === 0 && stats.mobile === 0) return null
                
                return (
                  <div key={month} className="flex justify-between items-center py-1 px-2 rounded-lg bg-slate-50/50 dark:bg-[#070c12]/40 border border-slate-100 dark:border-white/5">
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300 w-8">{month}</span>
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                      {stats.urlaub > 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{stats.urlaub} U</span>}
                      {stats.krank > 0 && <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">{stats.krank} K</span>}
                      {stats.mobile > 0 && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">{stats.mobile} M</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
