"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { calculateTripVacationCost } from "@/lib/tripUtils"

export default function YearlyContributionGraph() {
  const selectedYear = useStore(state => state.selectedYear)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const holidays = useStore(state => state.holidays)

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
    let colIndex = 0

    // We build the array column by column, 7 days at a time
    // Stop when we pass yearEnd AND finish the current week (Sunday)
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

      // Calculate if day has vacation
      let primaryStatus = ""
      let secondaryStatus = ""
      
      if (isCurrentYear && activeProfileIds.length > 0) {
        // 1. Check trips first (typically full days, 'U')
        const blockingStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
        const blockingTrips = trips.filter(t => 
          blockingStatuses.includes(t.status) &&
          t.startDate <= dateStr && 
          t.endDate >= dateStr &&
          t.profiles.some(p => activeProfileIds.includes(p.id))
        )
        
        let hasTripDay = false
        let hasSabbaticalDay = false
        if (blockingTrips.length > 0) {
          for (const trip of blockingTrips) {
            for (const profileId of activeProfileIds) {
              if (trip.profiles.some(p => p.id === profileId)) {
                const p = profiles.find(pr => pr.id === profileId)
                if (p) {
                  const singleDayTrip = { ...trip, startDate: dateStr, endDate: dateStr }
                  const cost = calculateTripVacationCost(singleDayTrip, p, holidays)
                  if (cost > 0) hasTripDay = true
                  else if (trip.type === "Sabbatical") hasSabbaticalDay = true
                }
              }
            }
          }
        }
        
        if (hasTripDay) {
          primaryStatus = "u"
        } else if (hasSabbaticalDay) {
          primaryStatus = "a"
        } else {
          // 2. Check manual entries
          const manualEntries = entries.filter(e => e.date === dateStr && activeProfileIds.includes(e.profileId))
          // For simplicity, just pick the first entry type or combine if there's a half day
          if (manualEntries.length > 0) {
            const e = manualEntries[0]
            if (e.type === '2') primaryStatus = "u-2"
            else if (e.type === '3') primaryStatus = "k-2"
            else if (e.type === '4') primaryStatus = "ue-2"
            else primaryStatus = e.type.toLowerCase()
          }
        }
      }

      daysArray.push({
        date: dateStr,
        isCurrentYear,
        monthIndex: currentDate.getMonth(),
        status: primaryStatus
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { days: daysArray, months: monthsArray }
  }, [selectedYear, entries, trips, activeProfileIds, profiles, holidays])

  const getCssClass = (day: { date: string, isCurrentYear: boolean, monthIndex: number, status: string }) => {
    if (!day.isCurrentYear) return 'bg-transparent'
    if (!day.status) {
      // empty day with month alternating banding
      return day.monthIndex % 2 === 0 
        ? 'bg-slate-100 dark:bg-[var(--border)]' 
        : 'bg-slate-200 dark:bg-white/10'
    }
    return `status-${day.status}`
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
              {days.map((day, i) => (
                <div
                  key={day.date}
                  title={`${day.date}${day.status ? ` (${day.status.toUpperCase()})` : ''}`}
                  className={`w-5 h-5 rounded-sm ${getCssClass(day)} transition-all duration-300 hover:ring-2 hover:ring-brand-500 hover:scale-110 cursor-pointer shadow-sm`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
