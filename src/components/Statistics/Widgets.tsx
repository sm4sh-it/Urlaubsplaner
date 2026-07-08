"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { isVacationCostingDay } from "@/lib/tripUtils"
import { getProfileStatsForYear } from "@/lib/profileUtils"
import { Plane, Car, Train, Ship, Bike, Info, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react"

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

  const maxCount = stats.length > 0 ? stats[0][1] : 1

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Art der Reise</h3>
      {stats.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex flex-col gap-4">
          {stats.map(([type, count]) => (
            <div key={type} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm text-slate-300">
                <span>{type}</span>
                <span className="font-semibold">{count}x</span>
              </div>
              <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
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
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Transportmittel</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.list.map(([type, count], idx) => {
            const percentage = Math.round((count / stats.total) * 100)
            const color = colors[idx % colors.length]
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#161b22] text-slate-300" style={{ color }}>
                  {getIcon(type)}
                </div>
                <div className="flex-1 text-sm text-slate-200">{type}</div>
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

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full justify-between">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Buchungsstatus</h3>
      {stats.total === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex h-16 rounded-lg overflow-hidden">
          {stats.counts['Idee'] > 0 && <div className="bg-[#fde047] h-full" style={{ width: `${(stats.counts['Idee'] / stats.total) * 100}%` }} title={`Idee: ${stats.counts['Idee']}`} />}
          {stats.counts['In Planung'] > 0 && <div className="bg-[#ff9f43] h-full" style={{ width: `${(stats.counts['In Planung'] / stats.total) * 100}%` }} title={`In Planung: ${stats.counts['In Planung']}`} />}
          {stats.counts['Gebucht'] > 0 && <div className="bg-[#23d160] h-full" style={{ width: `${(stats.counts['Gebucht'] / stats.total) * 100}%` }} title={`Gebucht: ${stats.counts['Gebucht']}`} />}
          {stats.counts['Abgeschlossen'] > 0 && <div className="bg-slate-500 h-full" style={{ width: `${(stats.counts['Abgeschlossen'] / stats.total) * 100}%` }} title={`Abgeschlossen: ${stats.counts['Abgeschlossen']}`} />}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fde047]" /> Idee</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ff9f43]" /> In Planung</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#23d160]" /> Gebucht</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500" /> Abgeschlossen</div>
      </div>
    </div>
  )
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
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full justify-center">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Ø Urlaubsdauer</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-100">{avg}</span>
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
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full justify-center">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
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
          <p className="text-sm text-slate-400 mt-4 leading-relaxed italic">
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
      const wDay = d.getDay() // 0 = Sun, 1 = Mon...
      if (!workingDaysArr.includes(wDay)) return // Not a working day anyway
      
      // Check surrounding days
      const dPrev = new Date(d)
      dPrev.setDate(d.getDate() - 1)
      const dNext = new Date(d)
      dNext.setDate(d.getDate() + 1)
      
      const prevIsWeekend = !workingDaysArr.includes(dPrev.getDay())
      const nextIsWeekend = !workingDaysArr.includes(dNext.getDay())
      
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
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full justify-center">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Genutzte Brückentage</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-brand-500">{count}</span>
        <span className="text-lg text-slate-500 mb-1">Tage</span>
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

  const colors = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e']

  let cumulativePercent = 0

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Reisetyp</h3>
      {stats.list.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center">Keine Daten vorhanden</div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6 my-auto">
          <div className="relative w-32 h-32 flex-shrink-0">
            {/* Base Circle */}
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full">
               <circle cx="50" cy="50" r="40" fill="transparent" stroke="#161b22" strokeWidth="20" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              {stats.list.map(([type, count], idx) => {
                const percent = (count / stats.total) * 100
                const strokeDasharray = `${percent} 100`
                const strokeDashoffset = -cumulativePercent
                cumulativePercent += percent
                
                // Add a small gap by reducing the painted percentage very slightly if there are multiple segments
                const adjustedPercent = stats.list.length > 1 ? percent - 1 : percent
                const adjustedDasharray = `${adjustedPercent > 0 ? adjustedPercent : 0} 100`

                return (
                  <circle
                    key={type}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={adjustedDasharray}
                    strokeDashoffset={strokeDashoffset}
                    pathLength="100"
                    strokeLinecap="round"
                  />
                )
              })}
            </svg>
          </div>
          <div className="flex flex-col gap-3 flex-1 w-full justify-center">
            {stats.list.map(([type, count], idx) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                  <span className="text-slate-300">{type}</span>
                </div>
                <span className="font-bold text-slate-100">{Math.round((count / stats.total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
