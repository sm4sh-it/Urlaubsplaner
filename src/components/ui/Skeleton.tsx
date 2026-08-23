"use client"

import React from "react"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`}
      {...props}
    />
  )
}

/**
 * Skeleton für Reise- & Urlaubskarten auf dem Dashboard
 */
export function TripCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161f28]/65 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 animate-pulse min-w-0">
      <div className="flex flex-col gap-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title & Date */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <div className="flex -space-x-1.5">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton für Tabellen-Zeilen (z. B. Reise-Archiv & Budget-Listen)
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white dark:bg-[#0d141d]/75 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm overflow-hidden animate-pulse">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24 hidden sm:block" />
        <Skeleton className="h-4 w-28 hidden md:block" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4 gap-4">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton für Statistik-Widgets
 */
export function WidgetSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161f28]/65 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-pulse min-h-[220px]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="w-6 h-6 rounded-lg" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}
