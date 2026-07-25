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

  const { days, months } = useMemo(() => {
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
          label: currentDate.toLocaleString('default', { month: 'short' }),
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

    return { days: daysArray, months: monthsArray }
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
        background: `linear-gradient(135deg, ${day.amColor} 50%, var(--surface-bright, rgba(203, 213, 225, 0.3)) 50%)`,
        opacity: day.isIdea ? 0.5 : 1
      }
    }

    if (day.pmColor) {
      return {
        background: `linear-gradient(135deg, var(--surface-bright, rgba(203, 213, 225, 0.3)) 50%, ${day.pmColor} 50%)`,
        opacity: day.isIdea ? 0.5 : 1
      }
    }

    return {}
  }

  const getDayClass = (day: typeof days[0]) => {
    if (!day.isCurrentYear) return 'bg-transparent'
    if (!day.fullColor && !day.amColor && !day.pmColor) {
      return day.monthIndex % 2 === 0 
        ? 'bg-slate-100 dark:bg-[var(--border)]' 
        : 'bg-slate-200 dark:bg-white/10'
    }
    return ''
  }

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-[var(--border-subtle)] pb-8 pt-4 items-center">
      <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        Jahresübersicht {selectedYear}
      </div>
      
      <div className="flex max-w-full justify-center">
        {/* Days of week labels */}
        <div className="flex flex-col gap-1 text-xs font-medium text-slate-400 mr-4 mt-[30px]">
          <span className="h-5 leading-5">Mo</span>
          <span className="h-5 leading-5 invisible">Di</span>
          <span className="h-5 leading-5">Mi</span>
          <span className="h-5 leading-5 invisible">Do</span>
          <span className="h-5 leading-5">Fr</span>
          <span className="h-5 leading-5 invisible">Sa</span>
          <span className="h-5 leading-5">So</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-4 pl-1">
          <div className="min-w-max pr-4">
            {/* Months Row */}
            <div className="relative h-6 mb-1.5 flex text-xs font-medium text-slate-400">
              {months.map((m, i) => (
                <div 
                  key={i} 
                  className="absolute"
                  style={{ left: `${m.colIndex * 24}px` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            <div 
              className="grid gap-1"
              style={{
                gridTemplateRows: 'repeat(7, 20px)',
                gridAutoFlow: 'column',
                gridAutoColumns: '20px'
              }}
            >
              {days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}${day.labelText ? ` (${day.labelText})` : ''}`}
                  className={`w-5 h-5 rounded-sm ${getDayClass(day)} transition-all duration-300 hover:ring-2 hover:ring-brand-500 hover:scale-110 cursor-pointer shadow-sm`}
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
