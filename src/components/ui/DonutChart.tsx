import React from "react"
import { cn } from "@/lib/utils"

export interface DonutSegment {
  type: string
  percent: number
  offset: number
  color: string
}

interface DonutChartProps {
  title: string
  segments: DonutSegment[]
  emptyText?: string
  className?: string
}

export function DonutChart({ title, segments, emptyText = "Keine Daten vorhanden", className }: DonutChartProps) {
  const totalPercent = segments.reduce((acc, seg) => acc + seg.percent, 0)
  const isEmpty = segments.length === 0 || totalPercent === 0

  return (
    <div className={cn("bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl h-full", className)}>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">{title}</h3>
      {isEmpty ? (
        <div className="text-slate-500 text-sm my-auto text-center">{emptyText}</div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6 my-auto">
          <div className="relative w-32 h-32 flex-shrink-0">
            {/* Base Circle */}
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-100 dark:text-[#161b22]">
               <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              {segments.map((seg) => {
                if (seg.percent <= 0) return null
                const strokeDashoffset = -seg.offset
                
                // Add a small gap by reducing the painted percentage very slightly if there are multiple segments
                const adjustedPercent = segments.length > 1 ? seg.percent - 1 : seg.percent
                const adjustedDasharray = `${adjustedPercent > 0 ? adjustedPercent : 0} 100`

                return (
                  <circle
                    key={seg.type}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
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
            {segments.map((seg) => (
              seg.percent > 0 && (
                <div key={seg.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={seg.type}>{seg.type}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-100">{Math.round(seg.percent)}%</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
