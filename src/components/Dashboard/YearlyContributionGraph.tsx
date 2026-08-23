"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"

export default function YearlyContributionGraph() {
  const selectedYear = useStore(state => state.selectedYear)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const holidays = useStore(state => state.holidays)

  const getStatusColor = (type: string): string => {
    const t = type.toLowerCase().trim()
    switch (t) {
      case 'u':
      case 'urlaub': return 'var(--color-vacation)'
      case 'm':
      case 'mobiles arbeiten': return 'var(--color-mobile)'
      case 'a':
      case 'sabbatical':
      case 'auszeit': return 'var(--color-auszeit)'
      case 's':
      case 'sonderurlaub': return 'var(--color-special)'
      case 'ü':
      case 'ue':
      case 'überstundenabbau': return 'var(--color-overtime)'
      case 'k':
      case 'krank':
      case 'krankheit': return 'var(--color-sick)'
      case 'b':
      case 'g':
      case 'bildungsurlaub':
      case 'blockiert': return 'var(--color-bildungsurlaub)'
      case 'd':
      case 'dienstreise': return 'var(--color-dienstreise)'
      case 'x':
      case 'urlaubsblocker':
      case 'blockiert_tag': return 'repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 3px, var(--color-blocked) 3px, var(--color-blocked) 6px)'
      default: return 'var(--color-vacation)'
    }
  }

  const { days, months, weeksCount } = useMemo(() => {
    const yearStart = new Date(selectedYear, 0, 1)
    const yearEnd = new Date(selectedYear, 11, 31)
    
    // Find the Monday on or before Jan 1st
    const startDate = new Date(yearStart)
    const startDay = startDate.getDay() // 0 is Sunday
    const offset = startDay === 0 ? 6 : startDay - 1
    startDate.setDate(startDate.getDate() - offset)

    const daysArray = []
    const monthsArray: { label: string; colIndex: number }[] = []
    
    let currentDate = new Date(startDate)

    while (currentDate <= yearEnd || currentDate.getDay() !== 1) {
      if (currentDate.getDay() === 1 && currentDate > yearEnd) {
        break; // we reached Monday of the week after year end
      }

      const yyyy = currentDate.getFullYear()
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
      const dd = String(currentDate.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`
      const isCurrentYear = currentDate.getFullYear() === selectedYear
      
      // Track months
      if (isCurrentYear && currentDate.getDate() === 1) {
        monthsArray.push({
          label: currentDate.toLocaleString('de-DE', { month: 'short' }),
          colIndex: Math.floor(daysArray.length / 7)
        })
      }

      let fullColor: string | null = null
      let amColor: string | null = null
      let pmColor: string | null = null
      let isIdea = false
      let labelText = ""

      if (isCurrentYear && activeProfileIds.length > 0) {
        const blockingStatuses = ["In Planung", "Gebucht", "Abgeschlossen", "Idee"]
        const blockingTrips = trips.filter(t => 
          blockingStatuses.includes(t.status) &&
          t.startDate <= dateStr && 
          t.endDate >= dateStr &&
          t.profiles.some(p => activeProfileIds.includes(p.id))
        )
        
        if (blockingTrips.length > 0) {
          for (const trip of blockingTrips) {
            if (trip.status === "Idee") isIdea = true
            const color = getStatusColor(trip.type)
            if (!trip.isHalfDay) {
              fullColor = color
              labelText = trip.title || trip.type
            } else {
              if (trip.halfDayType === "NACHMITTAG") {
                pmColor = color
              } else {
                amColor = color
              }
              labelText = labelText ? `${labelText} / ${trip.title || trip.type}` : `${trip.title || trip.type} (Halber Tag)`
            }
          }
        } else {
          // Check manual entries
          const manualEntries = entries.filter(e => e.date === dateStr && activeProfileIds.includes(e.profileId))
          if (manualEntries.length > 0) {
            const parts = manualEntries[0].type.split(',').map(p => p.trim())
            
            const mapHalfDayCodeToColor = (code: string): string | null => {
              switch (code) {
                case '2': return getStatusColor('u')   // Halber Tag Urlaub (U/2)
                case '5': return getStatusColor('m')   // Halber Tag Mobiles Arbeiten (M/2)
                case '6': return getStatusColor('s')   // Halber Tag Sonderurlaub (S/2)
                case '4': return getStatusColor('ue')  // Halber Tag Überstunden (Ü/2)
                case '3': return getStatusColor('k')   // Halber Tag Krankheit (K/2)
                default: return null
              }
            }

            if (parts.length === 1) {
              const code = parts[0]
              const halfColor = mapHalfDayCodeToColor(code)
              if (halfColor) {
                amColor = halfColor
              } else {
                fullColor = getStatusColor(code)
              }
            } else if (parts.length >= 2) {
              amColor = mapHalfDayCodeToColor(parts[0]) || getStatusColor(parts[0])
              pmColor = mapHalfDayCodeToColor(parts[1]) || getStatusColor(parts[1])
            }
          }
        }
      }

      daysArray.push({
        date: dateStr,
        isCurrentYear,
        monthIndex: currentDate.getMonth(),
        fullColor,
        amColor,
        pmColor,
        isIdea,
        labelText
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    const weeksCount = Math.ceil(daysArray.length / 7)
    return { days: daysArray, months: monthsArray, weeksCount }
  }, [selectedYear, entries, trips, activeProfileIds, profiles, holidays])

  const getDayStyle = (day: typeof days[0]) => {
    if (!day.isCurrentYear) return {}

    if (day.fullColor) {
      return { background: day.fullColor, opacity: day.isIdea ? 0.5 : 1 }
    }

    if (day.amColor && day.pmColor) {
      return {
        background: `linear-gradient(135deg, ${day.amColor} 50%, ${day.pmColor} 50%)`,
        opacity: day.isIdea ? 0.5 : 1
      }
    }

    if (day.amColor) {
      return {
        background: `linear-gradient(135deg, ${day.amColor} 50%, var(--surface-bright) 50%)`,
        opacity: day.isIdea ? 0.5 : 1
      }
    }

    if (day.pmColor) {
      return {
        background: `linear-gradient(135deg, var(--surface-bright) 50%, ${day.pmColor} 50%)`,
        opacity: day.isIdea ? 0.5 : 1
      }
    }

    return {}
  }

  const getDayClass = (day: typeof days[0]) => {
    if (!day.isCurrentYear) return 'bg-transparent pointer-events-none opacity-0 shadow-none'
    if (!day.fullColor && !day.amColor && !day.pmColor) {
      return day.monthIndex % 2 === 0 
        ? 'bg-slate-100 dark:bg-slate-800/40' 
        : 'bg-slate-200/80 dark:bg-slate-800/70'
    }
    return ''
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header (Clean ohne Icon, ohne Kasten) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Jahres-Aktivitätsübersicht</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-bold">
              {selectedYear}
            </span>
          </h3>
        </div>

        {/* Schnelllegende */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-vacation)' }} />
            <span>Urlaub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-mobile)' }} />
            <span>Mobiles Arbeiten</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-sick)' }} />
            <span>Krank</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-special)' }} />
            <span>Sonder</span>
          </div>
        </div>
      </div>
      
      {/* Heatmap Grid - Responsive fluid up to 1600px, graceful scroll on < 1000px */}
      <div className="w-full overflow-x-auto custom-scrollbar p-1 sm:p-2">
        <div className="w-full min-w-[960px] flex items-start px-2 py-3">
          {/* Days of week labels */}
          <div className="flex flex-col select-none mr-2 sm:mr-3 shrink-0">
            {/* Header spacer to match month labels row */}
            <div className="h-5 mb-2" />
            <div className="grid grid-rows-7 gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              <span className="flex items-center justify-end aspect-square">Mo</span>
              <span className="flex items-center justify-end aspect-square invisible">Di</span>
              <span className="flex items-center justify-end aspect-square">Mi</span>
              <span className="flex items-center justify-end aspect-square invisible">Do</span>
              <span className="flex items-center justify-end aspect-square">Fr</span>
              <span className="flex items-center justify-end aspect-square invisible">Sa</span>
              <span className="flex items-center justify-end aspect-square">So</span>
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Months Row */}
            <div
              className="grid gap-1 sm:gap-1.5 h-5 mb-2 text-[10px] sm:text-xs font-mono font-bold text-slate-400 dark:text-slate-500 select-none"
              style={{
                gridTemplateColumns: `repeat(${weeksCount}, minmax(0, 1fr))`,
              }}
            >
              {months.map((m, i) => (
                <div
                  key={i}
                  className="truncate"
                  style={{ gridColumnStart: m.colIndex + 1 }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Days 7-row Heatmap Grid */}
            <div
              className="grid gap-1 sm:gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${weeksCount}, minmax(0, 1fr))`,
                gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                gridAutoFlow: "column",
              }}
            >
              {days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}${day.labelText ? ` (${day.labelText})` : ""}`}
                  className={`aspect-square w-full rounded-[4px] sm:rounded-[6px] ${getDayClass(day)} transition-all duration-150 hover:ring-2 hover:ring-brand-500 hover:scale-130 hover:z-30 cursor-pointer shadow-[0_1px_3px_rgba(15,23,42,0.22)] dark:shadow-none`}
                  style={getDayStyle(day)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

