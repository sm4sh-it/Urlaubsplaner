"use client"

import { useState } from "react"
import { useStore } from "@/store/useStore"
import { SHORT_MONTHS } from "@/lib/dateUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { ChevronUp, ChevronDown } from "lucide-react"

export default function Statistics() {
  const activeSidebarPanel = useStore(state => state.activeSidebarPanel)
  const setActiveSidebarPanel = useStore(state => state.setActiveSidebarPanel)
  const isOpen = activeSidebarPanel === 'statistics'
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const entries = useStore(state => state.entries)
  const overrides = useStore(state => state.overrides)
  const selectedYear = useStore(state => state.selectedYear)

  if (activeProfileIds.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-4 flex flex-col min-h-0 shrink-0">
        <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200">Statistik</h2>
        <div className="text-sm text-slate-500">Bitte wähle ein Profil aus.</div>
      </div>
    )
  }

  // Für Einfachheit nehmen wir das erste aktive Profil für die Detailansicht
  const activeProfile = profiles.find(p => p.id === activeProfileIds[0])
  if (!activeProfile) return null

  const stats = getProfileStatsForYear(activeProfile, selectedYear, overrides, entries)
  
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-4 flex flex-col min-h-0 shrink-0">
        <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200">Statistik ({activeProfile.name})</h2>
        <div className="text-sm text-slate-500">
          Profil ist für das Jahr {selectedYear} nicht aktiv (Startjahr: {activeProfile.startYear}).
        </div>
      </div>
    )
  }

  // Filtern der Einträge für dieses Jahr und Profil
  const yearEntries = entries.filter(e => 
    e.profileId === activeProfile.id && e.date.startsWith(selectedYear.toString())
  )

  let totalUrlaub = 0
  let totalKrank = 0
  let totalMobile = 0
  const monthlyStats = Array(12).fill(0).map(() => ({ urlaub: 0, krank: 0, mobile: 0 }))

  yearEntries.forEach(entry => {
    const month = parseInt(entry.date.split('-')[1]) - 1 // 0-11
    
    let urlaubVal = 0
    let krankVal = 0
    let mobileVal = 0

    if (entry.type === 'U') urlaubVal = 1
    if (entry.type === '2') urlaubVal = 0.5
    if (entry.type === 'K') krankVal = 1
    if (entry.type === '3') krankVal = 0.5
    if (entry.type === 'M') mobileVal = 1
    if (entry.type === '5') mobileVal = 0.5

    totalUrlaub += urlaubVal
    totalKrank += krankVal
    totalMobile += mobileVal
    
    if (month >= 0 && month < 12) {
      monthlyStats[month].urlaub += urlaubVal
      monthlyStats[month].krank += krankVal
      monthlyStats[month].mobile += mobileVal
    }
  })

  // Logik für Resturlaubs-Warnung
  // Wie viele Urlaubstage wurden VOR dem Verfallsdatum genommen?
  const expiryDateString = `${selectedYear}-${activeProfile.remainingLeaveExpiryDate}`
  const urlaubVorVerfall = yearEntries.filter(e => {
    if (e.date <= expiryDateString) {
      return e.type === 'U' || e.type === '2'
    }
    return false
  }).reduce((sum, e) => sum + (e.type === 'U' ? 1 : 0.5), 0)

  const verfuegbar = stats.totalAvailable
  const restUrlaubAktuell = verfuegbar - totalUrlaub

  // Wenn man mehr Urlaub nimmt als man Resturlaub hat, ist der Resturlaub quasi verbraucht.
  const ungenutzterResturlaub = Math.max(0, stats.remainingLeave - urlaubVorVerfall)

  return (
    <div className="bg-white dark:bg-[var(--surface)] rounded-xl shadow-sm border border-slate-200 dark:border-[var(--border-subtle)] p-4 flex flex-col min-h-0">
      <div 
        className="flex items-center justify-between cursor-pointer group mb-4"
        onClick={() => setActiveSidebarPanel(isOpen ? 'legend' : 'statistics')}
      >
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
          Statistik ({activeProfile.name})
        </h2>
        <button className="p-1 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 rounded-md transition-colors shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>
      </div>

      {isOpen && (
        <>
          {activeProfile.remainingLeave > 0 && (
        <div className={`mb-4 text-xs p-2 rounded border ${
          ungenutzterResturlaub > 0 
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" 
            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
        }`}>
          {ungenutzterResturlaub > 0 ? (
            <span><strong>Achtung:</strong> Plane noch {ungenutzterResturlaub} weitere Tage bis zum {activeProfile.remainingLeaveExpiryDate.split('-').reverse().join('.')}, um keinen Resturlaub zu verlieren.</span>
          ) : (
            <span><strong>Super:</strong> Dein kompletter Resturlaub ist bis zum Stichtag sicher eingeplant!</span>
          )}
        </div>
      )}
      
      <div className="space-y-4 mb-6 shrink-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-slate-500 dark:text-slate-400">Anspruch:</div>
          <div className="font-medium text-right dark:text-slate-200">{verfuegbar} Tage</div>
          
          <div className="text-slate-500 dark:text-slate-400">Genommen:</div>
          <div className="font-medium text-right text-emerald-600 dark:text-[#1b8a5a]">{totalUrlaub} Tage</div>
          
          <div className="text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-[var(--border-subtle)] pt-2 mt-1">Rest:</div>
          <div className="font-bold text-right border-t border-slate-100 dark:border-[var(--border-subtle)] pt-2 mt-1 text-slate-900 dark:text-white">{restUrlaubAktuell} Tage</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-100 dark:border-[var(--border-subtle)]">
          <div className="text-slate-500 dark:text-slate-400">Krankheitstage:</div>
          <div className="font-medium text-right text-red-600 dark:text-[#b0413e]">{totalKrank} Tage</div>
          
          <div className="text-slate-500 dark:text-slate-400">Mobiles Arbeiten:</div>
          <div className="font-medium text-right text-blue-600 dark:text-[#1a5fb4]">{totalMobile} Tage</div>
        </div>
      </div>

      <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Pro Monat</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 text-xs">
        {SHORT_MONTHS.map((month, i) => {
          const stats = monthlyStats[i]
          if (stats.urlaub === 0 && stats.krank === 0 && stats.mobile === 0) return null
          
          return (
            <div key={month} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[var(--border-subtle)] last:border-0">
              <span className="font-medium w-8 dark:text-slate-300">{month}</span>
              <div className="flex gap-3">
                {stats.urlaub > 0 && <span className="text-emerald-600 dark:text-[#1b8a5a]">{stats.urlaub} U</span>}
                {stats.krank > 0 && <span className="text-red-600 dark:text-[#b0413e]">{stats.krank} K</span>}
                {stats.mobile > 0 && <span className="text-blue-600 dark:text-[#1a5fb4]">{stats.mobile} M</span>}
              </div>
            </div>
          )
        })}
      </div>
        </>
      )}
    </div>
  )
}
