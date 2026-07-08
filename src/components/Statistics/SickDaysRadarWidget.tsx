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
      if (e.type === 'K' || e.type === '3') {
        const d = new Date(e.date)
        if (d.getFullYear() === selectedYear) {
          const day = d.getDay()
          counts[day] += (e.type === '3' ? 0.5 : 1)
        }
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
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full w-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Krankheitstage nach Wochentag</h3>
      <p className="text-xs text-slate-500 mb-2">Gibt es in {selectedYear} einen Wochentag, an dem du öfter krank bist?</p>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, maxCount]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
              itemStyle={{ color: '#ef4444' }}
            />
            <Radar name="Krankheitstage" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
