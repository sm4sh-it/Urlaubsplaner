"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { isVacationCostingDay } from "@/lib/tripUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { calculateHolidayEfficiency } from "@/lib/statisticsUtils"
import { Plane, Car, Train, Ship, Bike, Bus, Info, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays } from "lucide-react"
import { DonutChart, DualDonutChart } from "@/components/ui/DonutChart"
import { cn } from "@/lib/utils"

export function TripCategoryWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const items = useMemo(() => {
    const yearCounts = new Map<string, number>()
    const allTimeCounts = new Map<string, number>()
    let yearTotal = 0
    let allTimeTotal = 0

    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id)) && t.type && t.type.trim() !== '') {
        const type = t.type
        allTimeCounts.set(type, (allTimeCounts.get(type) || 0) + 1)
        allTimeTotal++

        const sYr = new Date(t.startDate).getFullYear()
        const eYr = new Date(t.endDate).getFullYear()
        if (sYr === selectedYear || eYr === selectedYear) {
          yearCounts.set(type, (yearCounts.get(type) || 0) + 1)
          yearTotal++
        }
      }
    })

    const getTypeColor = (type: string, idx: number) => {
      switch (type) {
        case 'Urlaub': return 'var(--color-vacation)'
        case 'Sabbatical': return 'var(--color-auszeit)'
        case 'Sonderurlaub': return 'var(--color-special)'
        case 'Mobiles Arbeiten': return 'var(--color-mobile)'
        case 'Überstundenabbau': return 'var(--color-overtime)'
        case 'Krankheit': return 'var(--color-sick)'
        default:
          const fallbackColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
          return fallbackColors[idx % fallbackColors.length]
      }
    }

    const getShortLabel = (type: string) => {
      if (type === 'Mobiles Arbeiten') return 'Mobil-Arbeit'
      if (type === 'Überstundenabbau') return 'Überstunden'
      return type
    }

    const allTypes = Array.from(new Set([...yearCounts.keys(), ...allTimeCounts.keys()]))
      .sort((a, b) => (allTimeCounts.get(b) || 0) - (allTimeCounts.get(a) || 0))
      .slice(0, 5)

    return allTypes.map((type, idx) => {
      const yCount = yearCounts.get(type) || 0
      const aCount = allTimeCounts.get(type) || 0
      return {
        type: getShortLabel(type),
        yearPercent: yearTotal > 0 ? (yCount / yearTotal) * 100 : 0,
        allTimePercent: allTimeTotal > 0 ? (aCount / allTimeTotal) * 100 : 0,
        color: getTypeColor(type, idx)
      }
    })
  }, [trips, activeProfileIds, selectedYear])

  return <DualDonutChart title="Art der Reise" yearLabel={String(selectedYear)} allTimeLabel="Ø" items={items} />
}

export function TransportWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    let total = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.transport && t.transport.trim() !== '') {
          const methods = t.transport.split(',').map(s => s.trim()).filter(Boolean)
          methods.forEach(m => {
            counts.set(m, (counts.get(m) || 0) + 1)
            total++
          })
        }
      }
    })
    return { list: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]), total }
  }, [trips, activeProfileIds])

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flugzeug': return <Plane className="w-4 h-4" />
      case 'eigenes auto': 
      case 'mietwagen': return <Car className="w-4 h-4" />
      case 'bahn': return <Train className="w-4 h-4" />
      case 'schiff': return <Ship className="w-4 h-4" />
      case 'fahrrad': return <Bike className="w-4 h-4" />
      case 'bus': return <Bus className="w-4 h-4" />
      default: return <div className="w-4 h-4 rounded-full bg-slate-400" />
    }
  }

  // Graduated Cyan-Green frequency scale (Rank 1 = Most used -> Rank 7+ = Least used)
  const rankColors = ['#10b981', '#14b8a6', '#06b6d4', '#0284c7', '#38bdf8', '#818cf8', '#84cc16']

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Transportmittel</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.list.map(([type, count], idx) => {
            const percentage = Math.round((count / stats.total) * 100)
            const opacity = Math.max(35, 100 - idx * 10)
            const color = `color-mix(in srgb, var(--brand) ${opacity}%, transparent)`
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-300" style={{ color }}>
                  {getIcon(type)}
                </div>
                <div className="flex-1 text-sm font-medium" style={{ color }}>{type}</div>
                <div className="text-sm font-bold" style={{ color }}>{percentage}%</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function StatusWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const items = useMemo(() => {
    const yearCounts = { 'Idee': 0, 'In Planung': 0, 'Gebucht': 0, 'Abgeschlossen': 0 }
    const allTimeCounts = { 'Idee': 0, 'In Planung': 0, 'Gebucht': 0, 'Abgeschlossen': 0 }
    let yearTotal = 0
    let allTimeTotal = 0

    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id)) && t.status in allTimeCounts) {
        const st = t.status as keyof typeof allTimeCounts
        allTimeCounts[st]++
        allTimeTotal++

        const sYr = new Date(t.startDate).getFullYear()
        const eYr = new Date(t.endDate).getFullYear()
        if (sYr === selectedYear || eYr === selectedYear) {
          yearCounts[st]++
          yearTotal++
        }
      }
    })

    const STATUS_COLORS: Record<string, string> = {
      'Idee': '#eab308',
      'In Planung': '#ff9f43',
      'Gebucht': '#1b8a5a',
      'Abgeschlossen': '#64748b'
    }

    const statuses = ['Idee', 'In Planung', 'Gebucht', 'Abgeschlossen']
    return statuses
      .filter(st => yearCounts[st as keyof typeof yearCounts] > 0 || allTimeCounts[st as keyof typeof allTimeCounts] > 0)
      .map(st => {
        const yCount = yearCounts[st as keyof typeof yearCounts]
        const aCount = allTimeCounts[st as keyof typeof allTimeCounts]
        return {
          type: st,
          yearPercent: yearTotal > 0 ? (yCount / yearTotal) * 100 : 0,
          allTimePercent: allTimeTotal > 0 ? (aCount / allTimeTotal) * 100 : 0,
          color: STATUS_COLORS[st] || '#64748b'
        }
      })
  }, [trips, activeProfileIds, selectedYear])

  return <DualDonutChart title="Buchungsstatus" yearLabel={String(selectedYear)} allTimeLabel="Ø" items={items} />
}

export function AvgDurationWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const avgData = useMemo(() => {
    const getYearAvg = (yr?: number) => {
      let t = 0; let c = 0;
      trips.forEach(trip => {
        if (trip.profiles.some(p => activeProfileIds.includes(p.id)) && trip.duration > 0) {
          if (yr === undefined || trip.startDate.startsWith(yr.toString())) {
            t += trip.isHalfDay ? 0.5 : trip.duration
            c++
          }
        }
      })
      return c === 0 ? 0 : +(t / c).toFixed(1)
    }

    return {
      allTime: getYearAvg(),
      history: [
        { year: selectedYear, avg: getYearAvg(selectedYear) },
        { year: selectedYear - 1, avg: getYearAvg(selectedYear - 1) },
        { year: selectedYear - 2, avg: getYearAvg(selectedYear - 2) }
      ]
    }
  }, [trips, activeProfileIds, selectedYear])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ø Urlaubsdauer</h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-bold text-blue-500 dark:text-blue-400">{avgData.allTime}</span>
        <span className="text-sm text-slate-500 mb-1">Tage (Gesamt)</span>
      </div>
      
      <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
        {avgData.history.map(h => (
          <div key={h.year} className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{h.year}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{h.avg > 0 ? `${h.avg} Tage` : '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { MapPin } from "lucide-react"

export function CountryWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    let total = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.country && t.country.trim() !== '') {
          counts.set(t.country, (counts.get(t.country) || 0) + 1)
          total++
        }
      }
    })
    return { list: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]), total }
  }, [trips, activeProfileIds])

  const colors = ['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981']

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Beliebtes Reiseland</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Länder eingetragen</div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.list.map(([country, count], idx) => {
            const percentage = Math.round((count / stats.total) * 100)
            const isTop = idx === 0
            const color = colors[idx % colors.length]
            return (
              <div key={country} className={cn("flex items-center gap-3", isTop ? "mb-2" : "")}>
                <div className={cn("flex items-center justify-center rounded-full text-white shrink-0", isTop ? "w-10 h-10 shadow-md" : "w-8 h-8 opacity-80")} style={{ backgroundColor: color }}>
                  <MapPin className={isTop ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className={cn("text-slate-700 dark:text-slate-200", isTop ? "font-bold text-base" : "font-medium text-sm")}>{country}</div>
                  {isTop && <div className="text-xs text-slate-500">Meistbesucht</div>}
                </div>
                <div className={cn("font-bold", isTop ? "text-lg" : "text-sm")} style={{ color }}>{percentage}%</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function BudgetWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const budgetData = useMemo(() => {
    const getBudgetStats = (yr?: number) => {
      let sumDev = 0
      let valid = 0
      trips.forEach(t => {
        if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
          const sYr = new Date(t.startDate).getFullYear()
          if ((yr === undefined || sYr === yr) && t.budget && t.cost && t.budget > 0) {
            const dev = ((t.cost - t.budget) / t.budget) * 100
            sumDev += dev
            valid++
          }
        }
      })
      return { dev: valid > 0 ? sumDev / valid : 0, valid }
    }

    const allTimeStats = getBudgetStats()

    return {
      avgDev: allTimeStats.dev,
      validTrips: allTimeStats.valid,
      history: [
        { year: selectedYear, ...getBudgetStats(selectedYear) },
        { year: selectedYear - 1, ...getBudgetStats(selectedYear - 1) },
        { year: selectedYear - 2, ...getBudgetStats(selectedYear - 2) }
      ]
    }
  }, [trips, activeProfileIds, selectedYear])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Budget vs. Realität
      </h3>
      {budgetData.validTrips === 0 ? (
         <div className="text-slate-500 text-sm mt-2">Trage bei deinen Reisen geplantes Budget und tatsächliche Kosten ein, um hier dein Finanz-Karma zu sehen.</div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-4xl font-bold ${budgetData.avgDev > 0 ? 'text-[#f85149]' : 'text-[#39d353]'}`}>
              {budgetData.avgDev > 0 ? '+' : ''}{budgetData.avgDev.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500 mb-1 leading-tight">
              Abweichung <br/>im Schnitt
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            {budgetData.history.map(h => (
              <div key={h.year} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{h.year}</span>
                <span className={cn("font-medium", h.valid > 0 ? (h.dev > 0 ? 'text-[#f85149]' : 'text-[#39d353]') : 'text-slate-400')}>
                  {h.valid > 0 ? `${h.dev > 0 ? '+' : ''}${h.dev.toFixed(1)}%` : '-'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function BridgeDaysWidget() {
  const entries = useStore(state => state.entries)
  const holidays = useStore(state => state.holidays)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const trips = useStore(state => state.trips)
  const selectedYear = useStore(state => state.selectedYear)

  const bridgeData = useMemo(() => {
    const activeProfile = profiles.find(p => p.id === activeProfileIds[0])
    if (!activeProfile) return { allTime: 0, history: [] }
    
    const workingDaysArr = activeProfile.workingDays.split(',').map(Number)

    const getBridgeCountForYear = (yr?: number) => {
      let bridgeCount = 0
      const vacationDates = new Set<string>()

      entries.forEach(e => {
        if (e.profileId !== activeProfile.id) return
        if (yr !== undefined && !e.date.startsWith(String(yr))) return
        e.type.split(',').forEach(part => {
          if (part === 'U' || part === '2') {
            vacationDates.add(e.date)
          }
        })
      })

      trips.forEach(t => {
        if (!t.profiles.some(p => p.id === activeProfile.id)) return
        const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
        const validTypes = ["Urlaub", "Sabbatical", "Sonderurlaub", "Überstundenabbau", "Wanderurlaub", "Städtetrip", "Strandurlaub", "Heimatbesuch", "Rundreise", "Skiurlaub", "Wellness", "Roadtrip", "Aktivurlaub", "Kombi-Reise"]
        if (!validTripStatuses.includes(t.status)) return
        if (!validTypes.includes(t.type)) return

        const start = new Date(t.startDate)
        const end = new Date(t.endDate)
        
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          if (yr === undefined || d.getFullYear() === yr) {
            const dateStr = d.toISOString().split('T')[0]
            vacationDates.add(dateStr)
          }
        }
      })

      Array.from(vacationDates).forEach(dateStr => {
        const d = new Date(dateStr)
        const wDay = d.getDay() === 0 ? 7 : d.getDay()
        if (!workingDaysArr.includes(wDay)) return
        
        const dPrev = new Date(d)
        dPrev.setDate(d.getDate() - 1)
        const dNext = new Date(d)
        dNext.setDate(d.getDate() + 1)
        
        const prevDay = dPrev.getDay() === 0 ? 7 : dPrev.getDay()
        const nextDay = dNext.getDay() === 0 ? 7 : dNext.getDay()

        const prevIsWeekend = !workingDaysArr.includes(prevDay)
        const nextIsWeekend = !workingDaysArr.includes(nextDay)
        
        const prevDateStr = `${dPrev.getFullYear()}-${String(dPrev.getMonth()+1).padStart(2,'0')}-${String(dPrev.getDate()).padStart(2,'0')}`
        const nextDateStr = `${dNext.getFullYear()}-${String(dNext.getMonth()+1).padStart(2,'0')}-${String(dNext.getDate()).padStart(2,'0')}`
        
        const prevIsHoliday = !!holidays[prevDateStr]
        const nextIsHoliday = !!holidays[nextDateStr]

        if ((prevIsHoliday && nextIsWeekend) || (prevIsWeekend && nextIsHoliday)) {
          bridgeCount++
        }
      })
      return bridgeCount
    }

    return {
      allTime: getBridgeCountForYear(),
      history: [
        { year: selectedYear, count: getBridgeCountForYear(selectedYear) },
        { year: selectedYear - 1, count: getBridgeCountForYear(selectedYear - 1) },
        { year: selectedYear - 2, count: getBridgeCountForYear(selectedYear - 2) }
      ]
    }
  }, [entries, trips, activeProfileIds, profiles, holidays, selectedYear])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Genutzte Brückentage</h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-bold text-brand-500">{bridgeData.allTime}</span>
        <span className="text-sm text-slate-500 mb-1">Tage (Gesamt)</span>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
        {bridgeData.history.map(h => (
          <div key={h.year} className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{h.year}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{h.count > 0 ? `${h.count} Tage` : '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TravelTypeWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const items = useMemo(() => {
    const yearCounts = new Map<string, number>()
    const allTimeCounts = new Map<string, number>()
    let yearTotal = 0
    let allTimeTotal = 0

    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id)) && t.travelType && t.travelType.trim() !== '') {
        const tt = t.travelType
        allTimeCounts.set(tt, (allTimeCounts.get(tt) || 0) + 1)
        allTimeTotal++

        const sYr = new Date(t.startDate).getFullYear()
        const eYr = new Date(t.endDate).getFullYear()
        if (sYr === selectedYear || eYr === selectedYear) {
          yearCounts.set(tt, (yearCounts.get(tt) || 0) + 1)
          yearTotal++
        }
      }
    })

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

    const allTypes = Array.from(new Set([...yearCounts.keys(), ...allTimeCounts.keys()]))
      .sort((a, b) => (allTimeCounts.get(b) || 0) - (allTimeCounts.get(a) || 0))
      .slice(0, 5)

    return allTypes.map((type, idx) => {
      const yCount = yearCounts.get(type) || 0
      const aCount = allTimeCounts.get(type) || 0
      return {
        type,
        yearPercent: yearTotal > 0 ? (yCount / yearTotal) * 100 : 0,
        allTimePercent: allTimeTotal > 0 ? (aCount / allTimeTotal) * 100 : 0,
        color: colors[idx % colors.length]
      }
    })
  }, [trips, activeProfileIds, selectedYear])

  return <DualDonutChart title="Reisetyp" yearLabel={String(selectedYear)} allTimeLabel="Ø" items={items} />
}

export function WorkRatioWidget() {
  const selectedYear = useStore(state => state.selectedYear)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const holidays = useStore(state => state.holidays)
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const activeProfile = profiles.find(p => p.id === activeProfileIds[0])
    if (!activeProfile) return null

    const workingDaysArr = activeProfile.workingDays.split(',').map(Number)
    
    let totalWorkDays = 0
    let vacationDays = 0
    let sickDays = 0
    let sabbaticalDays = 0
    let specialLeaveDays = 0

    const start = new Date(Date.UTC(selectedYear, 0, 1))
    const end = new Date(Date.UTC(selectedYear, 11, 31))

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const wDay = d.getUTCDay() === 0 ? 7 : d.getUTCDay()
      
      // Is it a potential working day?
      if (!workingDaysArr.includes(wDay)) continue
      if (holidays[dateStr]) continue // Holiday, not a working day
      
      totalWorkDays++

      // Check for absences
      let manualSick = 0
      let manualVacation = 0
      let manualSpecial = 0

      // 1. Check entries
      const entry = entries.find(e => e.profileId === activeProfile.id && e.date === dateStr)
      if (entry) {
        entry.type.split(',').forEach(part => {
          if (part === 'K') manualSick += 1
          else if (part === '3') manualSick += 0.5
          else if (part === 'U') manualVacation += 1
          else if (part === '2') manualVacation += 0.5
          else if (part === 'S') manualSpecial += 1
          else if (part === '6') manualSpecial += 0.5
        })
      }

      // 2. Check trips
      let tripVacation = 0
      let tripSabbatical = 0
      let tripSpecial = 0

      const trip = trips.find(t => {
        if (!t.profiles.some(p => p.id === activeProfile.id)) return false
        const tStart = new Date(t.startDate).toISOString().split('T')[0]
        const tEnd = new Date(t.endDate).toISOString().split('T')[0]
        return dateStr >= tStart && dateStr <= tEnd
      })

      if (trip && ["In Planung", "Gebucht", "Abgeschlossen"].includes(trip.status)) {
        if (trip.type === 'Sabbatical') tripSabbatical = 1
        else if (trip.type === 'Sonderurlaub') tripSpecial = 1
        else if (trip.type === 'Urlaub') tripVacation = 1
      }

      // Merge manually entered days and trips, capping at 1 per day total
      sickDays += manualSick
      
      let remainingCap = 1 - manualSick
      
      let actualVacation = Math.min(remainingCap, manualVacation || tripVacation)
      vacationDays += actualVacation
      remainingCap -= actualVacation

      let actualSabbatical = Math.min(remainingCap, tripSabbatical)
      sabbaticalDays += actualSabbatical
      remainingCap -= actualSabbatical

      let actualSpecial = Math.min(remainingCap, manualSpecial || tripSpecial)
      specialLeaveDays += actualSpecial
    }

    const totalMissed = vacationDays + sickDays + sabbaticalDays + specialLeaveDays
    const netWorkDays = totalWorkDays - totalMissed
    const ratio = totalWorkDays > 0 ? (totalMissed / totalWorkDays) * 100 : 0

    return {
      totalWorkDays,
      vacationDays,
      sickDays,
      sabbaticalDays,
      specialLeaveDays,
      totalMissed,
      netWorkDays,
      ratio
    }
  }, [selectedYear, entries, trips, holidays, profiles, activeProfileIds])

  if (!stats) return null

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Work - No Work {selectedYear}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Übersicht der Arbeitstage &amp; Abwesenheiten</p>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Mögliche Arbeitstage</span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {stats.ratio.toFixed(1)}% Abwesenheit
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{stats.totalWorkDays}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-vacation)' }}></div>Urlaub</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.vacationDays}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-sick)' }}></div>Krankheit</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.sickDays}</span>
        </div>
        {stats.sabbaticalDays > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-auszeit)' }}></div>Sabbatical</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.sabbaticalDays}</span>
          </div>
        )}
        {stats.specialLeaveDays > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-special)' }}></div>Sonderurlaub</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.specialLeaveDays}</span>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">Tatsächliche Arbeitstage</span>
            <span className="font-bold text-lg text-slate-600 dark:text-slate-400">{stats.netWorkDays}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 flex overflow-hidden">
            {stats.totalWorkDays > 0 && (
              <>
                <div className="h-full bg-slate-500 dark:bg-slate-400" style={{ width: `${(stats.netWorkDays / stats.totalWorkDays) * 100}%` }}></div>
                {stats.vacationDays > 0 && <div className="h-full" style={{ backgroundColor: 'var(--color-vacation)', width: `${(stats.vacationDays / stats.totalWorkDays) * 100}%` }}></div>}
                {stats.sickDays > 0 && <div className="h-full" style={{ backgroundColor: 'var(--color-sick)', width: `${(stats.sickDays / stats.totalWorkDays) * 100}%` }}></div>}
                {stats.sabbaticalDays > 0 && <div className="h-full" style={{ backgroundColor: 'var(--color-auszeit)', width: `${(stats.sabbaticalDays / stats.totalWorkDays) * 100}%` }}></div>}
                {stats.specialLeaveDays > 0 && <div className="h-full" style={{ backgroundColor: 'var(--color-special)', width: `${(stats.specialLeaveDays / stats.totalWorkDays) * 100}%` }}></div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function VacationHabitsWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const stats = useMemo(() => {
    let short = 0 // 1-3 days
    let medium = 0 // 4-10 days
    let long = 0 // 11-20 days
    let extreme = 0 // > 20 days ("Was ist arbeiten?")
    
    trips.forEach(t => {
      if (!t.profiles.some(p => activeProfileIds.includes(p.id))) return
      
      const startY = new Date(t.startDate).getFullYear()
      const endY = new Date(t.endDate).getFullYear()
      if (startY !== selectedYear && endY !== selectedYear) return
      
      if (t.type === 'Urlaub' || t.type === 'Sabbatical') {
        const d = t.duration || 1
        if (d > 20) extreme++
        else if (d > 10) long++
        else if (d >= 4) medium++
        else short++
      }
    })
    
    const total = short + medium + long + extreme
    return { short, medium, long, extreme, total }
  }, [trips, activeProfileIds, selectedYear])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl justify-start h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Urlaubsgewohnheiten
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reiselänge in {selectedYear}</p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Kurztrips (1-3 Tage)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.short}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#10b981] dark:bg-[#059669] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.short / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Normal (4-10 Tage)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.medium}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#3b82f6] dark:bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.medium / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Langurlaub (11-20 Tage)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.long}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#8b5cf6] dark:bg-[#7c3aed] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.long / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>

        {stats.extreme > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Was ist arbeiten? (&gt;20 Tage)</span>
              <span className="font-semibold text-amber-500 dark:text-amber-400">{stats.extreme}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-[#f59e0b] dark:bg-[#d97706] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.extreme / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function HolidayEfficiencyWidget() {
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const profiles = useStore(state => state.profiles)
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const holidays = useStore(state => state.holidays)
  const selectedYear = useStore(state => state.selectedYear)

  const activeProfile = activeProfileIds.length > 0 ? profiles.find(p => p.id === activeProfileIds[0]) : undefined

  const data = useMemo(() => {
    if (!activeProfile) return null
    return calculateHolidayEfficiency(selectedYear, activeProfile, entries, trips, holidays)
  }, [selectedYear, activeProfile, entries, trips, holidays])

  if (!data || data.blocks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-between">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Feiertags-Effizienz</h3>
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500 my-auto">
          <span className="text-xs">Keine Feiertags-Blöcke genutzt</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-between">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Feiertags-Effizienz</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">
              +{data.totalExtraDays}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tage extra Freizeit</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Ø {data.averageMultiplier.toFixed(1)}x Hebelwirkung
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {data.blocks.map((block, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#161b22] border border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={block.holidaysIncluded.join(', ')}>
                {block.holidaysIncluded.join(', ')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                ({new Date(block.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - {new Date(block.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {block.usedVacationDays}U / {block.totalFreeDays}F
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold whitespace-nowrap min-w-[44px] text-center">
                {block.multiplier.toFixed(1)}x
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PeakTravelMonthWidget() {
  const entries = useStore(state => state.entries)
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const monthCounts = new Array(12).fill(0)
    let totalDays = 0

    // Manual entries across ALL years
    entries.forEach(e => {
      if (activeProfileIds.includes(e.profileId)) {
        const parts = e.type.split(',')
        let isVacation = parts.some(p => p === 'U' || p === '2')
        if (isVacation) {
          const monthIdx = parseInt(e.date.split('-')[1], 10) - 1
          if (monthIdx >= 0 && monthIdx < 12) {
            const cost = parts.includes('U') ? 1 : 0.5
            monthCounts[monthIdx] += cost
            totalDays += cost
          }
        }
      }
    })

    // Trips across ALL years
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id)) && (t.type === 'Urlaub' || t.type === 'Sabbatical')) {
        const tStart = new Date(t.startDate)
        const tEnd = new Date(t.endDate)
        for (let d = new Date(tStart); d <= tEnd; d.setDate(d.getDate() + 1)) {
          const monthIdx = d.getMonth()
          if (monthIdx >= 0 && monthIdx < 12) {
            monthCounts[monthIdx] += 1
            totalDays += 1
          }
        }
      }
    })

    const monthNames = [
      "Januar", "Februar", "März", "April", "Mai", "Juni", 
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ]

    const list = monthCounts
      .map((count, idx) => ({ month: monthNames[idx], count: Math.round(count) }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)

    return { list, totalDays: Math.round(totalDays) }
  }, [entries, trips, activeProfileIds])

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Top Reisemonat</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Urlaubstage eingetragen</div>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          {stats.list.slice(0, 3).map((item, idx) => {
            const isTop = idx === 0
            const color = colors[idx % colors.length]
            return (
              <div key={item.month} className={cn("flex items-center gap-3", isTop ? "mb-1" : "")}>
                <div className={cn("flex items-center justify-center rounded-full text-white shrink-0", isTop ? "w-10 h-10 shadow-md" : "w-8 h-8 opacity-80")} style={{ backgroundColor: color }}>
                  <CalendarDays className={isTop ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className={cn("text-slate-700 dark:text-slate-200 truncate", isTop ? "font-bold text-base" : "font-medium text-sm")}>{item.month}</div>
                  {isTop && <div className="text-xs text-amber-500 dark:text-amber-400 font-medium">Beliebtester Monat (Gesamt)</div>}
                </div>
                <div className={cn("font-bold shrink-0 ml-1", isTop ? "text-lg" : "text-sm")} style={{ color }}>
                  {item.count} {item.count === 1 ? 'Tag' : 'Tage'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
