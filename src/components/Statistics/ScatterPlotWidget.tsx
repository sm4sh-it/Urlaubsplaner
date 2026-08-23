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
    <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm flex flex-col h-full w-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kosten vs. Reisedauer</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Wie effizient waren deine Reisen im Jahr {selectedYear}?</p>
      
      {data.length === 0 ? (
        <div className="text-slate-400 dark:text-slate-500 text-sm my-auto text-center flex-1 flex items-center justify-center">Zu wenig Daten für eine Analyse.</div>
      ) : (
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="duration" 
                name="Dauer" 
                unit=" Tage" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border, #cbd5e1)' }}
              />
              <YAxis 
                type="number" 
                dataKey="cost" 
                name="Kosten" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border, #cbd5e1)' }}
                tickFormatter={(val) => `${val} €`}
              />
              <ZAxis type="category" dataKey="name" name="Reise" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const item = payload[0]?.payload
                  return (
                    <div className="bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs flex flex-col gap-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                      <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
                        <span>Dauer:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{item.duration} {item.duration === 1 ? 'Tag' : 'Tage'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
                        <span>Kosten:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{item.cost.toFixed(2)} €</span>
                      </div>
                    </div>
                  )
                }}
              />
              <Scatter name="Reisen" data={data} fill="#10b981" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
