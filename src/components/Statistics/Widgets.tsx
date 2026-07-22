"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { isVacationCostingDay } from "@/lib/tripUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { Plane, Car, Train, Ship, Bike, Info, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react"
import { DonutChart } from "@/components/ui/DonutChart"
import { cn } from "@/lib/utils"

export function TripCategoryWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.type && t.type.trim() !== '') {
          counts.set(t.type, (counts.get(t.type) || 0) + 1)
        }
      }
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5) // Top 5
  }, [trips, activeProfileIds])

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

  const total = stats.reduce((sum, [_, count]) => sum + count, 0)
  
  const segments = useMemo(() => {
    let cumulative = 0
    return stats.map(([type, count], idx) => {
      const percent = total > 0 ? (count / total) * 100 : 0
      const offset = cumulative
      cumulative += percent
      const color = getTypeColor(type, idx)
      return { type, count, percent, offset, color }
    })
  }, [stats, total])

  return <DonutChart title="Art der Reise" segments={segments} />
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
      default: return <div className="w-4 h-4 rounded-full bg-slate-700" />
    }
  }

  const colors = ['#39d353', '#26a641', '#006d32', '#0e4429', '#161b22']

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Transportmittel</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.list.map(([type, count], idx) => {
            const percentage = Math.round((count / stats.total) * 100)
            const color = colors[idx % colors.length]
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-[#161b22] text-slate-300" style={{ color }}>
                  {getIcon(type)}
                </div>
                <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">{type}</div>
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

  const stats = useMemo(() => {
    const counts = { 'Idee': 0, 'In Planung': 0, 'Gebucht': 0, 'Abgeschlossen': 0 }
    let total = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.status in counts) {
          counts[t.status as keyof typeof counts]++
          total++
        }
      }
    })
    return { counts, total }
  }, [trips, activeProfileIds])

  const STATUS_COLORS: Record<string, string> = {
    'Idee': '#eab308', // Yellow (status-badge request)
    'In Planung': '#ff9f43', // Orange (status-badge planning)
    'Gebucht': '#1b8a5a', // Green (status-badge confirmed)
    'Abgeschlossen': '#64748b' // Slate
  }

  const list = Object.entries(stats.counts).filter(([_, count]) => count > 0)
  
  const segments = useMemo(() => {
    let cumulative = 0
    return list.map(([type, count]) => {
      const percent = stats.total > 0 ? (count / stats.total) * 100 : 0
      const offset = cumulative
      cumulative += percent
      const color = STATUS_COLORS[type] || '#64748b'
      return { type, count, percent, offset, color }
    })
  }, [list, stats.total])

  return <DonutChart title="Buchungsstatus" segments={segments} />
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
            t += trip.duration
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
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ø Urlaubsdauer</h3>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-blue-500 dark:text-blue-400">{avgData.allTime}</span>
        <span className="text-lg text-slate-500 mb-1">Tage</span>
      </div>
      
      <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
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

  const { avgDev, validTrips } = useMemo(() => {
    let sumDev = 0
    let valid = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.budget && t.cost && t.budget > 0) {
          const dev = ((t.cost - t.budget) / t.budget) * 100
          sumDev += dev
          valid++
        }
      }
    })
    return { avgDev: valid > 0 ? sumDev / valid : 0, validTrips: valid }
  }, [trips, activeProfileIds])

  const getHumorousText = (dev: number) => {
    if (dev > 20) return "Oha! Deine Urlaube eskalieren finanziell völlig. 💸"
    if (dev > 5) return "Immer etwas teurer als gedacht... typisch! 🤷‍♂️"
    if (dev > -5) return "Wow, Punktlandung! Du planst wie ein Buchhalter. 🤓"
    if (dev > -20) return "Schnäppchenjäger! Günstiger als geplant. 🤑"
    return "Hast du den Urlaub im Garten verbracht? Extrem gespart! 🏕️"
  }

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Budget vs. Realität
      </h3>
      {validTrips === 0 ? (
         <div className="text-slate-500 text-sm mt-2">Trage bei deinen Reisen geplantes Budget und tatsächliche Kosten ein, um hier dein Finanz-Karma zu sehen.</div>
      ) : (
        <>
          <div className="flex items-end gap-2 mt-2">
            <span className={`text-4xl font-bold ${avgDev > 0 ? 'text-[#f85149]' : 'text-[#39d353]'}`}>
              {avgDev > 0 ? '+' : ''}{avgDev.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500 mb-1 leading-tight">
              Abweichung <br/>im Schnitt
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed italic">
            "{getHumorousText(avgDev)}"
          </p>
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

  const count = useMemo(() => {
    const activeProfile = profiles.find(p => p.id === activeProfileIds[0])
    if (!activeProfile) return 0
    
    let bridgeCount = 0
    const workingDaysArr = activeProfile.workingDays.split(',').map(Number)

    const vacationDates = new Set<string>()

    entries.forEach(e => {
      if (e.profileId !== activeProfile.id) return
      e.type.split(',').forEach(part => {
        if (part === 'U' || part === '2') {
          vacationDates.add(e.date)
        }
      })
    })

    trips.forEach(t => {
      if (!t.profiles.some(p => p.id === activeProfile.id)) return
      const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
      const validTypes = ["Urlaub", "Sonderurlaub", "Sabbatical", "Überstundenabbau", "Wanderurlaub", "Städtetrip", "Strandurlaub", "Heimatbesuch", "Rundreise", "Skiurlaub", "Wellness", "Roadtrip", "Aktivurlaub", "Kombi-Reise"]
      if (!validTripStatuses.includes(t.status)) return
      if (!validTypes.includes(t.type)) return

      const start = new Date(t.startDate)
      const end = new Date(t.endDate)
      
      for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        vacationDates.add(dateStr)
      }
    })

    Array.from(vacationDates).forEach(dateStr => {
      const d = new Date(dateStr)
      
      // Is it a working day?
      const wDay = d.getDay() === 0 ? 7 : d.getDay() // 0 = Sun -> 7, 1 = Mon...
      if (!workingDaysArr.includes(wDay)) return // Not a working day anyway
      
      // Check surrounding days
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
  }, [entries, trips, activeProfileIds, profiles, holidays])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-start">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Genutzte Brückentage</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-brand-500">{count}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        Urlaubstage genau zwischen einem Feiertag und einem Wochenende. (Zählt für alle Jahre aufsteigend)
      </p>
    </div>
  )
}

export function TravelTypeWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    let total = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id))) {
        if (t.travelType && t.travelType.trim() !== '') {
          counts.set(t.travelType, (counts.get(t.travelType) || 0) + 1)
          total++
        }
      }
    })
    return { list: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]), total }
  }, [trips, activeProfileIds])

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

  const segments = useMemo(() => {
    let cumulative = 0
    return stats.list.map(([type, count], idx) => {
      const percent = stats.total > 0 ? (count / stats.total) * 100 : 0
      const offset = cumulative
      cumulative += percent
      const color = colors[idx % colors.length]
      return { type, count, percent, offset, color }
    })
  }, [stats.list, stats.total])

  return <DonutChart title="Reisetyp" segments={segments} />
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
        <p className="text-xs text-brand-500 font-bold mt-1">{stats.ratio.toFixed(1)}% Fehltage</p>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Mögliche Arbeitstage</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{stats.totalWorkDays}</span>
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
    let long = 0 // > 10 days
    
    trips.forEach(t => {
      if (!t.profiles.some(p => activeProfileIds.includes(p.id))) return
      
      const startY = new Date(t.startDate).getFullYear()
      const endY = new Date(t.endDate).getFullYear()
      if (startY !== selectedYear && endY !== selectedYear) return
      
      if (t.type === 'Urlaub' || t.type === 'Sabbatical') {
        const d = t.duration || 1
        if (d <= 3) short++
        else if (d <= 10) medium++
        else long++
      }
    })
    
    const total = short + medium + long
    return { short, medium, long, total }
  }, [trips, activeProfileIds, selectedYear])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl justify-start h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Urlaubsgewohnheiten
        </h3>
        <p className="text-xs text-brand-500 font-bold mt-1">Reiselänge in {selectedYear}</p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">Kurztrips (1-3 Tage)</span>
            <span className="font-semibold text-slate-900 dark:text-white">{stats.short}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#10b981] dark:bg-[#059669] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.short / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">Normal (4-10 Tage)</span>
            <span className="font-semibold text-slate-900 dark:text-white">{stats.medium}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#3b82f6] dark:bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.medium / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">Langurlaub (&gt;10 Tage)</span>
            <span className="font-semibold text-slate-900 dark:text-white">{stats.long}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#8b5cf6] dark:bg-[#7c3aed] h-full rounded-full transition-all duration-500" style={{ width: stats.total ? `${(stats.long / stats.total) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
