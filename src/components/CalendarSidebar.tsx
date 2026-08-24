"use client"

import React from "react"
import { useStore } from "@/store/useStore"
import { BarChart3, BookOpen, PanelRightClose } from "lucide-react"
import Statistics from "@/components/Statistics"
import Legend from "@/components/Legend"

export default function CalendarSidebar() {
  const activeSidebarPanel = useStore(state => state.activeSidebarPanel)
  const setActiveSidebarPanel = useStore(state => state.setActiveSidebarPanel)
  const toggleSidebar = useStore(state => state.toggleSidebar)

  return (
    <div className="w-full h-full bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col min-h-0 overflow-hidden">
      {/* Header with Segmented Control & Close Button */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-slate-100 dark:border-white/10 shrink-0 gap-2 bg-slate-50/50 dark:bg-white/[0.02]">
        {/* Segmented Control Switcher */}
        <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl flex-1 text-xs font-semibold">
          <button
            onClick={() => setActiveSidebarPanel("statistics")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              activeSidebarPanel === "statistics"
                ? "bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Statistik</span>
          </button>
          <button
            onClick={() => setActiveSidebarPanel("legend")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              activeSidebarPanel === "legend"
                ? "bg-white dark:bg-[#0d141d] text-slate-800 dark:text-slate-100 shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Legende</span>
          </button>
        </div>

        {/* Integrated Close Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          title="Seitenleiste ausblenden"
          aria-label="Seitenleiste ausblenden"
        >
          <PanelRightClose className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Content Area with Single Smooth Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar min-h-0">
        {activeSidebarPanel === "statistics" ? <Statistics /> : <Legend />}
      </div>
    </div>
  )
}
