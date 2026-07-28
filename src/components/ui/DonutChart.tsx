import React, { useState, useEffect } from "react"
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const totalPercent = segments.reduce((acc, seg) => acc + seg.percent, 0)
  const isEmpty = segments.length === 0 || totalPercent === 0

  return (
    <div className={cn("bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col shadow-xl h-full justify-between", className)}>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {isEmpty ? (
        <div className="text-slate-500 text-sm my-auto text-center">{emptyText}</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 my-auto w-full min-w-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 transition-transform duration-300 ease-out hover:scale-105">
            {/* Base Circle */}
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-100 dark:text-[#161b22]">
               <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              {segments.map((seg) => {
                if (seg.percent <= 0) return null
                const strokeDashoffset = -seg.offset
                
                const adjustedPercent = segments.length > 1 ? seg.percent - 1 : seg.percent
                const targetDasharray = `${adjustedPercent > 0 ? adjustedPercent : 0} 100`

                return (
                  <circle
                    key={seg.type}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={mounted ? targetDasharray : "0 100"}
                    strokeDashoffset={strokeDashoffset}
                    pathLength="100"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                )
              })}
            </svg>
          </div>
          <div className="flex flex-col gap-2 flex-1 w-full min-w-0 justify-center">
            {segments.map((seg) => (
              seg.percent > 0 && (
                <div key={seg.type} className="flex items-center justify-between text-xs sm:text-sm gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-700 dark:text-slate-300 truncate" title={seg.type}>{seg.type}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-100 shrink-0 ml-1">{Math.round(seg.percent)}%</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface DualDonutItem {
  type: string
  yearPercent: number
  allTimePercent: number
  color: string
}

interface DualDonutChartProps {
  title: string
  yearLabel: string
  allTimeLabel?: string
  items: DualDonutItem[]
  emptyText?: string
  className?: string
}

export function DualDonutChart({
  title,
  yearLabel,
  allTimeLabel = "Ø",
  items,
  emptyText = "Keine Daten vorhanden",
  className
}: DualDonutChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const hasYearData = items.some(i => i.yearPercent > 0)
  const hasAllTimeData = items.some(i => i.allTimePercent > 0)
  const isEmpty = !hasYearData && !hasAllTimeData

  const renderSingleDonut = (percProp: 'yearPercent' | 'allTimePercent') => {
    let cumulative = 0
    const activeItems = items.filter(i => i[percProp] > 0)
    
    if (activeItems.length === 0) {
      return (
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-100 dark:text-[#161b22]">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" />
          </svg>
        </div>
      )
    }

    const segmentsWithOffset = activeItems.map(item => {
      const offset = cumulative
      cumulative += item[percProp]
      return { ...item, offset }
    })

    return (
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 transition-transform duration-300 ease-out hover:scale-105">
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-100 dark:text-[#161b22]">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          {segmentsWithOffset.map((seg) => {
            const strokeDashoffset = -seg.offset
            const adjustedPercent = segmentsWithOffset.length > 1 ? seg[percProp] - 1 : seg[percProp]
            const targetDasharray = `${adjustedPercent > 0 ? adjustedPercent : 0} 100`

            return (
              <circle
                key={seg.type}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="20"
                strokeDasharray={mounted ? targetDasharray : "0 100"}
                strokeDashoffset={strokeDashoffset}
                pathLength="100"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className={cn("bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col shadow-xl h-full min-h-[220px] justify-between", className)}>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {isEmpty ? (
        <div className="text-slate-500 text-sm my-auto text-center">{emptyText}</div>
      ) : (
        <div className="flex items-center justify-between gap-2 sm:gap-4 my-auto w-full min-w-0">
          {/* Left Donut (Year) */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {renderSingleDonut('yearPercent')}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{yearLabel}</span>
          </div>

          {/* Middle Legend with Left and Right Percentages */}
          <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
            {items.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-xs sm:text-sm gap-1 min-w-0">
                {/* Year % (left) */}
                <span className="font-bold text-slate-800 dark:text-white shrink-0 text-right min-w-[32px]">
                  {item.yearPercent > 0 ? `${Math.round(item.yearPercent)}%` : '0%'}
                </span>

                {/* Dot + Category Name */}
                <div className="flex items-center justify-center gap-1.5 min-w-0 flex-1 text-center">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate font-medium" title={item.type}>{item.type}</span>
                </div>

                {/* All-Time % (right) */}
                <span className="font-bold text-slate-800 dark:text-white shrink-0 text-left min-w-[32px]">
                  {item.allTimePercent > 0 ? `${Math.round(item.allTimePercent)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>

          {/* Right Donut (All Time) */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {renderSingleDonut('allTimePercent')}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{allTimeLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
