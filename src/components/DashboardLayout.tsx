"use client"

import * as React from "react"
import { useStore } from "@/store/useStore"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function DashboardLayout({
  calendar,
  sidebar
}: {
  calendar: React.ReactNode
  sidebar: React.ReactNode
}) {
  const isSidebarOpen = useStore(state => state.isSidebarOpen)
  const toggleSidebar = useStore(state => state.toggleSidebar)

  return (
    <div className="flex flex-1 h-full relative overflow-hidden p-4">
      <div className={cn(
        "flex-1 flex min-w-0 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "mr-4" : "mr-0"
      )}>
        {calendar}
      </div>
      
      {/* Sidebar Container */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out shrink-0",
          isSidebarOpen ? "w-80 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"
        )}
      >
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-2 h-full">
          {sidebar}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-8 z-10 flex items-center justify-center w-8 h-12 bg-slate-200/50 hover:bg-slate-300/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all duration-300 rounded-l-xl backdrop-blur-sm",
          isSidebarOpen ? "right-84" : "right-4"
        )}
        title={isSidebarOpen ? "Seitenleiste ausblenden" : "Seitenleiste einblenden"}
      >
        {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  )
}
