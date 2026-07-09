"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { isVacationCostingDay } from "@/lib/tripUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { Plane, Car, Train, Ship, Bike, Info, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react"
import { DonutChart } from "@/components/ui/DonutChart"
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const total = stats.reduce((sum, [_, count]) => sum + count, 0)
  
  const segments = useMemo(() => {
    let cumulative = 0
    return stats.map(([type, count], idx) => {
      const percent = total > 0 ? (count / total) * 100 : 0
      const offset = cumulative
      cumulative += percent
      const color = COLORS[idx % COLORS.length]
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
    'Idee': '#fde047',
    'In Planung': '#ff9f43',
    'Gebucht': '#23d160',
    'Abgeschlossen': '#64748b'
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

  const avg = useMemo(() => {
    let totalDays = 0
    let count = 0
    trips.forEach(t => {
      if (t.profiles.some(p => activeProfileIds.includes(p.id)) && t.duration > 0) {
        totalDays += t.duration
        count++
      }
    })
    return count === 0 ? 0 : (totalDays / count).toFixed(1)
  }, [trips, activeProfileIds])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ø Urlaubsdauer</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{avg}</span>
        <span className="text-lg text-slate-500 mb-1">Tage</span>
      </div>
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
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-center">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Wallet className="w-4 h-4" /> Budget vs. Realität
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

  const count = useMemo(() => {
    const activeProfile = profiles.find(p => p.id === activeProfileIds[0])
    if (!activeProfile) return 0
    
    let bridgeCount = 0
    const workingDaysArr = activeProfile.workingDays.split(',').map(Number)

    entries.forEach(e => {
      if (e.profileId !== activeProfile.id) return
      if (e.type !== 'U' && e.type !== '2') return // Only vacation
      
      const d = new Date(e.date)
      
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
  }, [entries, activeProfileIds, profiles, holidays])

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full justify-center">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Genutzte Brückentage</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-brand-500">{count}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        Urlaubstage genau zwischen einem Feiertag und einem Wochenende.
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
