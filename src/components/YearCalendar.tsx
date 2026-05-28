"use client"

import * as React from "react"
import { useStore } from "@/store/useStore"
import { SHORT_MONTHS, getMonthDays } from "@/lib/dateUtils"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EntryType } from "@/types"

import { toggleEntry, getCalendarData } from "@/app/actions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VALID_KEYS: Record<string, EntryType> = {
  'u': 'U', 'U': 'U',
  '2': '2',
  'k': 'K', 'K': 'K',
  '3': '3',
  'ü': 'Ü', 'Ü': 'Ü',
  'g': 'G', 'G': 'G',
  'd': 'D', 'D': 'D',
  's': 'S', 'S': 'S',
  'x': 'X', 'X': 'X'
}

const ENTRY_COLORS: Record<string, string> = {
  'U': "bg-emerald-500 text-white",
  '2': "bg-emerald-300 text-emerald-900",
  'K': "bg-red-500 text-white",
  '3': "bg-red-300 text-red-900",
  'Ü': "bg-teal-500 text-white",
  'G': "bg-orange-500 text-white",
  'D': "bg-amber-600 text-white",
  'S': "bg-green-700 text-white",
  'X': "bg-neutral-600 text-white dark:bg-neutral-400 dark:text-neutral-900",
}

export default function YearCalendar() {
  const selectedYear = useStore(state => state.selectedYear)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const entries = useStore(state => state.entries)
  const addOrUpdateEntry = useStore(state => state.addOrUpdateEntry)
  const removeEntry = useStore(state => state.removeEntry)

  const [holidays, setHolidays] = React.useState<Record<string, string>>({})
  const [vacations, setVacations] = React.useState<{start: string, end: string, name: string}[]>([])
  const [pressedKey, setPressedKey] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  // Das aktive Profil, welches für die Feiertage/Ferien herangezogen wird
  const primaryProfile = activeProfileIds.length > 0 
    ? profiles.find(p => p.id === activeProfileIds[0])
    : null;
  const stateCode = primaryProfile?.stateCode || "NW"

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await getCalendarData(selectedYear, stateCode)
        setHolidays(data.holidays)
        setVacations(data.vacations)
      } catch (e) {
        console.error("Failed to load calendar data from DB")
      }
    }
    loadData()
  }, [selectedYear, stateCode])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (document.activeElement?.tagName === 'INPUT') return
      setPressedKey(e.key)
    }
    const handleKeyUp = () => setPressedKey(null)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    // Clear key if window loses focus
    window.addEventListener('blur', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleKeyUp)
    }
  }, [])

  const handleCellClick = (date: string) => {
    if (activeProfileIds.length === 0) return

    startTransition(async () => {
      const type = pressedKey ? VALID_KEYS[pressedKey] : null
      if (pressedKey && !type) return // Invalid key pressed

      for (const pId of activeProfileIds) {
        const profile = profiles.find(p => p.id === pId)
        if (!profile || selectedYear < profile.startYear) continue

        // Optimistic UI update could be added here, but Server Actions are fast enough usually
        // Let's do optimistic:
        if (!type) {
          const existing = entries.find(e => e.date === date && e.profileId === pId)
          if (existing) removeEntry(existing.id)
        } else {
          addOrUpdateEntry({ id: crypto.randomUUID(), date, type, profileId: pId })
        }

        // Persist to DB
        const result = await toggleEntry(date, type, pId)
        if (result.success && result.entry) {
          addOrUpdateEntry({
            id: result.entry.id,
            date: result.entry.date,
            type: result.entry.type as EntryType,
            profileId: result.entry.profileId
          })
        }
      }
    })
  }

  // Grid layout: 1 col für Monatsname + 31 cols für Tage
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Jahresübersicht {selectedYear}</h2>
        {pressedKey && VALID_KEYS[pressedKey] && (
          <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">
            Aktiv: {VALID_KEYS[pressedKey]} (Klicken zum Einfügen)
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 mt-2">
        {/* Header (Tage 1-31) */}
        <div className="grid grid-cols-[4rem_repeat(31,minmax(0,1fr))] gap-px bg-slate-200 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xs font-semibold text-slate-500">
            Monat
          </div>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <div key={day} className="bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xs font-semibold text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Monate 1-12 */}
        <div className="flex-1 grid grid-rows-12 bg-slate-200 dark:bg-slate-700 gap-px">
          {SHORT_MONTHS.map((monthName, monthIndex) => {
            const days = getMonthDays(selectedYear, monthIndex)
            
            return (
              <div key={monthIndex} className="grid grid-cols-[4rem_repeat(31,minmax(0,1fr))] gap-px">
                {/* Monatsname */}
                <div className="bg-white dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  {monthName}
                </div>
                
                {/* Tage */}
                {days.map((dayObj, i) => {
                  if (!dayObj.isValid) {
                    return <div key={i} className="bg-slate-100 dark:bg-slate-950/50" />
                  }

                  const holidayName = holidays[dayObj.date]
                  const isHoliday = !!holidayName
                  
                  // Prüfen ob der Tag in den Schulferien liegt
                  const activeVacation = vacations.find(v => dayObj.date >= v.start && dayObj.date <= v.end)
                  const isVacation = !!activeVacation

                      // Tooltip Format: Wochentag, DD.MM.YYYY
                      const dateObj = new Date(dayObj.date)
                      const weekday = dateObj.toLocaleDateString('de-DE', { weekday: 'long' })
                      const formattedDate = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      
                      let tooltip = `${weekday}, ${formattedDate}`
                      if (holidayName) tooltip += ` - ${holidayName}`
                      else if (activeVacation) tooltip += ` - ${activeVacation.name}`

                      return (
                        <div 
                          key={dayObj.date} 
                          onClick={() => handleCellClick(dayObj.date)}
                          className={cn(
                            "bg-white dark:bg-slate-800 flex flex-col relative group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer",
                            dayObj.isWeekend && "bg-slate-100 dark:bg-slate-800/80",
                            isHoliday && "bg-orange-50/50 dark:bg-orange-900/10"
                          )}
                          title={tooltip}
                        >
                          {/* Schulferien Indikator */}
                          {isVacation && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-400 dark:bg-sky-500 opacity-60 pointer-events-none" />
                          )}

                          {/* Feiertags Indikator */}
                          {isHoliday && (
                            <div className="absolute top-0 right-0 left-0 text-[8px] leading-tight text-center text-orange-600 dark:text-orange-400 font-medium truncate px-0.5 opacity-50 group-hover:opacity-100 pointer-events-none">
                              {holidayName.length > 5 ? holidayName.substring(0, 4) + '.' : holidayName}
                            </div>
                          )}

                          {/* Zellen-Inhalt für aktive Profile */}
                          <div className="flex-1 flex flex-col gap-px p-0.5 mt-2">
                            {activeProfileIds.map(profileId => {
                              const profile = profiles.find(p => p.id === profileId)
                              if (!profile || selectedYear < profile.startYear) return null

                              const entry = entries.find(e => e.date === dayObj.date && e.profileId === profileId)
                              if (!entry) return null
                              
                              const typeColors = ENTRY_COLORS[entry.type] || "bg-slate-200 text-slate-800"
                              
                              return (
                                <div 
                                  key={profileId} 
                                  className={cn(
                                    "flex-1 flex items-center justify-center text-[10px] font-bold rounded-[2px] border-2 border-solid",
                                    typeColors
                                  )}
                                  style={{ borderColor: profile.color }}
                                >
                                  {entry.type === '2' ? 'u' : entry.type === '3' ? 'k' : entry.type}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

