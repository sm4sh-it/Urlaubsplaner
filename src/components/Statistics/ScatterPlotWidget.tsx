"use client"

import { useStore } from "@/store/useStore"
import { useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

export default function ScatterPlotWidget() {
  const trips = useStore(state => state.trips)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const selectedYear = useStore(state => state.selectedYear)

  const data = useMemo(() => {
    return trips
      .filter(t => t.profiles.some(p => activeProfileIds.includes(p.id)))
      .filter(t => t.startDate.startsWith(selectedYear.toString()))
      .filter(t => t.cost != null && t.cost > 0 && t.duration > 0)
      .map(t => ({
        name: t.title,
        duration: t.duration,
        cost: t.cost,
        type: t.type
      }))
  }, [trips, activeProfileIds, selectedYear])

  return (
    <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 flex flex-col shadow-xl h-full w-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Kosten vs. Reisedauer</h3>
      <p className="text-xs text-slate-500 mb-6">Wie effizient waren deine Reisen im Jahr {selectedYear}?</p>
      
      {data.length === 0 ? (
        <div className="text-slate-500 text-sm my-auto text-center flex-1 flex items-center justify-center">Zu wenig Daten für eine Analyse.</div>
      ) : (
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="duration" 
                name="Dauer" 
                unit=" Tage" 
                stroke="#64748b" 
                tick={{fill: '#64748b', fontSize: 12}}
                tickLine={false}
                axisLine={{stroke: '#334155'}}
              />
              <YAxis 
                type="number" 
                dataKey="cost" 
                name="Kosten" 
                unit=" €" 
                stroke="#64748b" 
                tick={{fill: '#64748b', fontSize: 12}}
                tickLine={false}
                axisLine={{stroke: '#334155'}}
                tickFormatter={(val) => `€${val}`}
              />
              <ZAxis type="category" dataKey="name" name="Reise" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Scatter name="Reisen" data={data} fill="#10b981" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
