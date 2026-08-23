"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]

export default function SickDaysRadarWidget() {
  const entries = useStore(state => state.entries)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const data = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat

    entries.forEach(e => {
      if (!activeProfileIds.includes(e.profileId)) return
      const d = new Date(e.date)
      if (d.getFullYear() === selectedYear) {
        const day = d.getDay()
        e.type.split(',').forEach(part => {
          if (part === 'K') counts[day] += 1
          if (part === '3') counts[day] += 0.5
        })
      }
    })

    // We mostly care about Mon-Fri, maybe Sat/Sun if someone is sick then. Let's show Mon-Sun but shifted so Monday is top.
    // Recharts draws clockwise from top.
    return [
      { subject: 'Montag', count: counts[1] },
      { subject: 'Dienstag', count: counts[2] },
      { subject: 'Mittwoch', count: counts[3] },
      { subject: 'Donnerstag', count: counts[4] },
      { subject: 'Freitag', count: counts[5] },
      { subject: 'Wochenende', count: counts[6] + counts[0] }
    ]
  }, [entries, activeProfileIds, selectedYear])

  const maxCount = Math.max(...data.map(d => d.count), 5) // at least 5 for scale

  return (
    <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm flex flex-col h-full w-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Krankheitstage nach Wochentag</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Gibt es in {selectedYear} einen Wochentag, an dem du öfter krank bist?</p>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border, #e2e8f0)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, maxCount]} tick={false} axisLine={false} />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const item = payload[0]?.payload
                return (
                  <div className="bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 shadow-xl text-xs flex flex-col gap-1">
                    <p className="font-medium text-slate-500 dark:text-slate-400">{item.subject}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-3">
                      <span>Krankheitstage:</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{item.count}</span>
                    </p>
                  </div>
                )
              }}
            />
            <Radar name="Krankheitstage" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
