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
  'u': 'U', 
  'U': '2', // Shift+u -> halber Tag Urlaub
  'k': 'K', 
  'K': '3', // Shift+k -> halber Tag krank
  'ü': 'Ü', 
  'Ü': '4', // Shift+ü -> halber Tag Überstunden
  'g': 'G', 'G': 'G',
  'd': 'D', 'D': 'D',
  's': 'S', 'S': 'S',
  'x': 'X', 'X': 'X',
  'm': 'M', 
  'M': '5' // Shift+m -> halber Tag mobiles arbeiten
}

const ENTRY_CLASSES: Record<string, string> = {
  'U': "status-u",
  '2': "status-u-2",
  'K': "status-k",
  '3': "status-k-2",
  'Ü': "status-ue",
  '4': "status-ue-2",
  'G': "status-g",
  'D': "status-d",
  'S': "status-s",
  'X': "status-x",
  'M': "status-m",
  '5': "status-m-2",
}

export default function YearCalendar() {
  const selectedYear = useStore(state => state.selectedYear)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const addOrUpdateEntry = useStore(state => state.addOrUpdateEntry)
  const removeEntry = useStore(state => state.removeEntry)

  const holidays = useStore(state => state.holidays)
  const [vacations, setVacations] = React.useState<{start: string, end: string, name: string, stateCode?: string}[]>([])
  const [pressedKey, setPressedKey] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const primaryProfile = activeProfileIds.length > 0 
    ? profiles.find(p => p.id === activeProfileIds[0])
    : null;
  const stateCode = primaryProfile?.stateCode || "NW"

  // Process trips to virtual entries
  const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
  const activeTrips = trips.filter(t => validTripStatuses.includes(t.status))

  const getTripForProfileAndDate = (profileId: string, date: string) => {
    return activeTrips.find(t => 
      t.profiles.some(p => p.id === profileId) &&
      date >= t.startDate && date <= t.endDate
    )
  }

  const mapTripTypeToEntryType = (type: string): EntryType => {
    if (type === "Urlaub") return "U"
    if (type === "Mobiles Arbeiten") return "M"
    if (type === "Sonderurlaub" || type === "Sabbatical") return "S"
    if (type === "Überstundenabbau") return "Ü"
    return "U" // Fallback
  }

  React.useEffect(() => {
    async function loadData() {
      try {
        const primaryProfile = activeProfileIds.length > 0 
          ? profiles.find(p => p.id === activeProfileIds[0])
          : null;
        const stateCode = primaryProfile?.stateCode || "NW"
        const data = await getCalendarData(selectedYear, stateCode)
        setVacations(data.vacations)
      } catch (e) {
        console.error("Failed to load calendar data from DB")
      }
    }
    loadData()
  }, [selectedYear, activeProfileIds, profiles])

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

        // Block if covered by a trip
        if (getTripForProfileAndDate(pId, date)) {
          continue
        }

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

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden select-none">
      <div className="flex items-center justify-between pb-6 shrink-0">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xl tracking-tight">Jahresübersicht {selectedYear}</h2>
        {pressedKey && VALID_KEYS[pressedKey] && (
          <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">
            Aktiv: {VALID_KEYS[pressedKey]} (Klicken zum Einfügen)
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 overflow-auto pr-2 pb-4">
        {/* Header (Tage 1-31) */}
        <div className="grid grid-cols-[50px_repeat(31,minmax(24px,1fr))] md:grid-cols-[80px_repeat(31,minmax(35px,1fr))] gap-1 md:gap-1.5 mb-2 shrink-0">
          <div className="bg-transparent flex items-center text-xs font-semibold text-slate-500 pl-2">
            
          </div>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <div key={day} className="bg-transparent flex items-center justify-center text-xs font-bold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Monate 1-12 */}
        <div className="flex flex-col gap-1.5">
          {SHORT_MONTHS.map((monthName, monthIndex) => {
            const days = getMonthDays(selectedYear, monthIndex)
            
            return (
              <div key={monthIndex} className="grid grid-cols-[50px_repeat(31,minmax(24px,1fr))] md:grid-cols-[80px_repeat(31,minmax(35px,1fr))] gap-1 md:gap-1.5">
                {/* Monatsname */}
                <div className="bg-transparent flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200 pl-2 sticky left-0 z-20">
                  {monthName}
                </div>
                
                {/* Tage */}
                {days.map((dayObj, i) => {
                  if (!dayObj.isValid) {
                    return (
                      <div key={i} className="rounded-md pointer-events-none bg-[var(--bg)]" />
                    )
                  }

                  const holidayName = holidays[dayObj.date]
                  const isHoliday = !!holidayName
                  
                  // Prüfen ob der Tag in den Schulferien liegt
                  const activeVacations = vacations.filter(v => dayObj.date >= v.start && dayObj.date <= v.end)
                  const isVacation = activeVacations.length > 0

                      // Tooltip Format: Wochentag, DD.MM.YYYY
                      const dateObj = new Date(dayObj.date)
                      const weekday = dateObj.toLocaleDateString('de-DE', { weekday: 'long' })
                      const formattedDate = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      
                      let tooltip = `${weekday}, ${formattedDate}`
                      if (holidayName) {
                        tooltip += ` - ${holidayName}`
                      } else if (activeVacations.length > 0) {
                        if (stateCode === 'ALL') {
                          const stateMapper: Record<string, string> = {
                            BW: "BaWü", BY: "Bayern", BE: "Berlin", BB: "Brandenb.", HB: "Bremen",
                            HH: "Hamburg", HE: "Hessen", MV: "MeckPom", NI: "Nds", NW: "NRW",
                            RP: "RLP", SL: "Saarl.", SN: "Sachsen", ST: "Sachs-Anh.", SH: "SH", TH: "Thür."
                          }
                          const grouped = activeVacations.reduce((acc, v) => {
                            // Extract just "Herbst" from "Herbstferien" to keep it short if possible
                            const shortName = v.name.replace('ferien', '').trim()
                            if (!acc[shortName]) acc[shortName] = []
                            // @ts-ignore
                            if (v.stateCode && !acc[shortName].includes(v.stateCode)) acc[shortName].push(v.stateCode)
                            return acc
                          }, {} as Record<string, string[]>)
                          
                          const vStrings = Object.entries(grouped).map(([name, codes]) => {
                            const shortCodes = codes.map(c => stateMapper[c] || c).join(', ')
                            return `${name} - ${shortCodes}`
                          })
                          tooltip += ` - ${vStrings.join(' | ')}`
                        } else {
                          tooltip += ` - ${activeVacations[0].name}`
                        }
                      }

                      return (
                        <div 
                          key={dayObj.date} 
                          onClick={() => {
                            // If all active profiles are blocked by a trip, ignore click entirely.
                            // But handleCellClick already skips individual profiles if blocked.
                            handleCellClick(dayObj.date)
                          }}
                          className={cn(
                            "flex flex-col relative group cursor-pointer overflow-hidden rounded-md h-[40px]",
                            "bg-slate-100 dark:bg-[var(--surface)] border border-slate-200 dark:border-white/5",
                            "hover:bg-slate-200 dark:hover:bg-[var(--surface-bright)] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200",
                            dayObj.isWeekend && "cell-weekend",
                            isHoliday && "cell-feiertag"
                          )}
                          title={tooltip}
                        >
                          {/* Schulferien Indikator */}
                          {isVacation && (
                            <div className="absolute bottom-1 left-1.5 right-1.5 h-[2px] bg-[#ff9f43]/70 rounded-full pointer-events-none z-20" />
                          )}

                          {/* Feiertags Indikator */}
                          {isHoliday && (
                            <div className="absolute top-0 right-0 left-0 text-[8px] leading-tight text-center text-[#ff7b72] font-medium truncate px-0.5 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                              {holidayName.length > 5 ? holidayName.substring(0, 4) + '.' : holidayName}
                            </div>
                          )}

                          {/* Zellen-Inhalt für aktive Profile */}
                          <div className="flex-1 flex flex-col gap-0.5 p-0.5 z-10 w-full h-full justify-center">
                            {activeProfileIds.map(profileId => {
                              const profile = profiles.find(p => p.id === profileId)
                              if (!profile || selectedYear < profile.startYear) return null

                              const trip = getTripForProfileAndDate(profileId, dayObj.date)
                              let entryType: EntryType | null = null
                              
                              if (trip) {
                                entryType = mapTripTypeToEntryType(trip.type)
                              } else {
                                const entry = entries.find(e => e.date === dayObj.date && e.profileId === profileId)
                                if (entry) entryType = entry.type
                              }
                              
                              if (!entryType) return null
                              
                              const typeClass = ENTRY_CLASSES[entryType] || "bg-slate-200 text-slate-800"
                              
                              return (
                                <div 
                                  key={profileId} 
                                  className={cn(
                                    "flex-1 flex items-center justify-center text-[10px] font-bold rounded-sm border-2 border-solid shadow-sm w-full",
                                    typeClass,
                                    trip ? "opacity-90" : ""
                                  )}
                                  style={{ borderColor: profile.color }}
                                  title={trip ? `Trip: ${trip.title}` : undefined}
                                >
                                  {entryType === '2' ? 'U/2' : entryType === '3' ? 'K/2' : entryType === '4' ? 'Ü/2' : entryType === '5' ? 'M/2' : entryType}
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

