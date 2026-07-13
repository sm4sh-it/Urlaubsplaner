"use client"

import * as React from "react"
import { useStore } from "@/store/useStore"
import { SHORT_MONTHS, getMonthDays } from "@/lib/dateUtils"
import { cn } from "@/lib/utils"
import { EntryType } from "@/types"

import { toggleEntry, getCalendarData } from "@/app/actions"



const VALID_KEYS: Record<string, EntryType> = {
  'u': 'U', 
  'U': '2', // Shift+u -> halber Tag Urlaub
  'k': 'K', 
  'K': '3', // Shift+k -> halber Tag krank
  'ü': 'Ü', 
  'Ü': '4', // Shift+ü -> halber Tag Überstunden
  'b': 'B', 'B': 'B',
  'd': 'D', 'D': 'D',
  'a': 'A', 'A': 'A', // a -> Auszeit/Sabbatical
  'x': 'X', 'X': 'X',
  'm': 'M', 
  'M': '5', // Shift+m -> halber Tag mobiles arbeiten
  's': 'S', 
  'S': '6', // Shift+s -> halber Tag Sonderurlaub
}

const ENTRY_CLASSES: Record<string, string> = {
  'U': "status-u",
  '2': "status-u-2",
  'K': "status-k",
  '3': "status-k-2",
  'Ü': "status-ue",
  '4': "status-ue-2",
  'B': "status-b",
  'G': "status-b", // Backwards compat
  'D': "status-d",
  'S': "status-s",
  '6': "status-s-2",
  'X': "status-x",
  'M': "status-m",
  '5': "status-m-2",
  'A': "status-a",
}

const HALF_TO_FULL: Record<string, string> = {
  '2': 'U',
  '3': 'K',
  '4': 'Ü',
  '5': 'M',
  '6': 'S'
}

const HALF_TO_LABEL: Record<string, string> = {
  '2': 'U/2',
  '3': 'K/2',
  '4': 'Ü/2',
  '5': 'M/2',
  '6': 'S/2'
}

export default function YearCalendar() {
  const selectedYear = useStore(state => state.selectedYear)
  const activeProfileIds = useStore(state => state.activeProfileIds) || []
  const profiles = useStore(state => state.profiles) || []
  const entries = useStore(state => state.entries) || []
  const trips = useStore(state => state.trips) || []
  const addOrUpdateEntry = useStore(state => state.addOrUpdateEntry)
  const removeEntry = useStore(state => state.removeEntry)

  const holidays = useStore(state => state.holidays) || {}
  const vacations = useStore(state => state.vacations) || []
  const [pressedKey, setPressedKey] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const primaryProfile = activeProfileIds.length > 0 
    ? profiles.find(p => p.id === activeProfileIds[0])
    : null;
  const stateCode = primaryProfile?.stateCode || "NW"

  const tripLookup = React.useMemo(() => {
    const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen", "Idee"]
    const activeTrips = trips.filter(t => validTripStatuses.includes(t.status))
    
    const lookup: Record<string, { type: EntryType, title: string, isIdea: boolean }> = {}
    for (const t of activeTrips) {
      const type = mapTripTypeToEntryType(t.type)
      const start = new Date(t.startDate)
      const end = new Date(t.endDate)
      
      for (const p of t.profiles) {
        let current = new Date(start)
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0]
          const key = `${p.id}_${dateStr}`
          lookup[key] = { type, title: t.title, isIdea: t.status === "Idee" }
          current.setUTCDate(current.getUTCDate() + 1)
        }
      }
    }
    return lookup
  }, [trips])

  const entryLookup = React.useMemo(() => {
    const lookup: Record<string, EntryType> = {}
    for (const e of entries) {
      const key = `${e.profileId}_${e.date}`
      lookup[key] = e.type
    }
    return lookup
  }, [entries])

  function mapTripTypeToEntryType(type: string): EntryType {
    if (type === "Urlaub") return "U"
    if (type === "Mobiles Arbeiten") return "M"
    if (type === "Sabbatical") return "A"
    if (type === "Sonderurlaub") return "S"
    if (type === "Überstundenabbau") return "Ü"
    return "U" // Fallback
  }



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
        const isTripBlock = tripLookup[`${pId}_${date}`]
        if (isTripBlock) {
          continue
        }

        // Optimistic UI update could be added here, but Server Actions are fast enough usually
        // Let's do optimistic:
        const existing = entries.find(e => e.date === date && e.profileId === pId)

        let newType: string | null = null

        if (!type) {
          // Deleting (LIFO)
          if (existing) {
             const parts = existing.type.split(',')
             if (parts.length > 1) {
               parts.pop() // remove the last one added
               newType = parts.join(',')
             } else {
               newType = null // fully delete
             }
          }
        } else {
          // Adding (LIFO stack)
          if (existing) {
            const isHalfDay = ['2','3','4','5','6'].includes(type)
            if (!isHalfDay) {
              newType = type // Full day overwrites everything
            } else {
              const parts = existing.type.split(',')
              const allHalfDays = parts.every(p => ['2','3','4','5','6'].includes(p))
              if (!allHalfDays) {
                 newType = type // Full day was there, overwrite with half day
              } else {
                 parts.push(type)
                 if (parts.length > 2) {
                   parts.shift() // Remove the oldest one
                 }
                 newType = parts.join(',')
              }
            }
          } else {
            newType = type
          }
        }

        // Optimistic UI
        if (!newType) {
          if (existing) removeEntry(existing.id)
        } else {
          if (existing) {
            addOrUpdateEntry({ ...existing, type: newType })
          } else {
            const tempId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'temp_' + Date.now().toString(36) + Math.random().toString(36).substring(2)
            addOrUpdateEntry({ id: tempId, date, type: newType, profileId: pId })
          }
        }

        // Persist to DB
        const result = await toggleEntry(date, newType, pId)
        if (result.success && result.entry) {
          addOrUpdateEntry({
            id: result.entry.id,
            date: result.entry.date,
            type: result.entry.type,
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

                  const holidayName = holidays ? holidays[dayObj.date] : null
                  const isHoliday = !!holidayName
                  
                  // Prüfen ob der Tag in den Schulferien liegt
                  const activeVacations = (vacations || []).filter(v => dayObj.date >= v.start && dayObj.date <= v.end)
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
                            const stateCode = v.stateCode;
                            if (stateCode && !acc[shortName].includes(stateCode)) acc[shortName].push(stateCode)
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
                            "bg-stone-100 dark:bg-[var(--surface)] border border-stone-200 dark:border-white/5",
                            "hover:bg-stone-200 dark:hover:bg-[var(--surface-bright)] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200",
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
                          <div className={cn("z-10 w-full h-full justify-center overflow-hidden", 
                            (() => {
                              const dayEntriesCount = activeProfileIds.filter(pId => {
                                const p = profiles.find(pr => pr.id === pId)
                                if (!p || selectedYear < p.startYear) return false
                                const lKey = `${pId}_${dayObj.date}`
                                return tripLookup[lKey] || entryLookup[lKey]
                              }).length

                              if (dayEntriesCount <= 2) return "flex flex-col gap-0.5 p-0.5"
                              if (dayEntriesCount === 3) return "flex flex-col gap-px p-0"
                              if (dayEntriesCount === 4) return "grid grid-cols-2 grid-rows-2 gap-px p-0"
                              if (dayEntriesCount === 5) return "flex flex-col gap-px p-0"
                              if (dayEntriesCount >= 6) return "grid grid-cols-3 grid-rows-2 gap-px p-0"
                              return "flex flex-col gap-px p-0"
                            })()
                          )}>
                            {(() => {
                              const dayEntriesCount = activeProfileIds.filter(pId => {
                                const p = profiles.find(pr => pr.id === pId)
                                if (!p || selectedYear < p.startYear) return false
                                const lKey = `${pId}_${dayObj.date}`
                                return tripLookup[lKey] || entryLookup[lKey]
                              }).length
                              const isCompact = dayEntriesCount > 2

                              return activeProfileIds.map(profileId => {
                                const profile = profiles.find(p => p.id === profileId)
                                if (!profile || selectedYear < profile.startYear) return null

                                const lookupKey = `${profileId}_${dayObj.date}`
                                const tripEntry = tripLookup[lookupKey]
                                let entryType: string | null = tripEntry?.type || entryLookup[lookupKey] || null
                                
                                if (!entryType) return null
                                
                                const parts = entryType.split(',')

                                // Render stacked half-days
                                if (parts.length === 2 && !tripEntry) {
                                  const typeClass1 = ENTRY_CLASSES[HALF_TO_FULL[parts[0]] || parts[0]] || "bg-slate-200 text-slate-800"
                                  const typeClass2 = ENTRY_CLASSES[HALF_TO_FULL[parts[1]] || parts[1]] || "bg-slate-200 text-slate-800"
                                  return (
                                    <div key={profileId} className={cn("flex flex-col rounded-sm overflow-hidden border-solid shadow-sm w-full h-full", 
                                      isCompact ? "border-[1px] flex-1" : "border-2 shrink-0 flex-1"
                                    )} style={{ borderColor: profile.color }}>
                                      <div className={cn("flex-1 flex items-center justify-center font-bold w-full leading-none", typeClass1, isCompact ? "text-[0px]" : "text-[8px]")}>
                                        {!isCompact && (HALF_TO_LABEL[parts[0]] || parts[0])}
                                      </div>
                                      <div className={cn("flex-1 flex items-center justify-center font-bold w-full leading-none", typeClass2, isCompact ? "text-[0px]" : "text-[8px]")}>
                                        {!isCompact && (HALF_TO_LABEL[parts[1]] || parts[1])}
                                      </div>
                                    </div>
                                  )
                                }
                                
                                const typeClass = ENTRY_CLASSES[entryType] || "bg-slate-200 text-slate-800"
                                const label = HALF_TO_LABEL[entryType] || entryType
                                
                                return (
                                  <div 
                                    key={profileId} 
                                    className={cn(
                                      "flex items-center justify-center font-bold rounded-sm border-solid shadow-sm w-full h-full",
                                      isCompact ? "border-[1px] text-[0px] flex-1" : "border-2 shrink-0 flex-1 text-[10px]",
                                      typeClass,
                                      tripEntry ? (tripEntry.isIdea ? "opacity-50 border-dashed" : "opacity-90") : ""
                                    )}
                                    style={{ borderColor: profile.color }}
                                    title={tripEntry ? `Trip: ${tripEntry.title}` : undefined}
                                  >
                                    {!isCompact && label}
                                  </div>
                                )
                              })
                            })()}
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

