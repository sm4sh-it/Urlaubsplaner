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

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      useStore.setState({ isSidebarOpen: false })
    }
  }, [])

  return (
    <div className="flex flex-1 h-full relative overflow-hidden p-2 sm:p-4">
      <div className={cn(
        "flex-1 flex min-w-0 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "mr-2 md:mr-4" : "mr-0"
      )}>
        {calendar}
      </div>
      
      {/* Sidebar Container */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out shrink-0 z-30",
          isSidebarOpen ? "w-72 sm:w-80 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"
        )}
      >
        <div className="w-72 sm:w-80 flex flex-col gap-4 overflow-y-auto pr-1 sm:pr-2 pb-2 h-full custom-scrollbar">
          {sidebar}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-4 sm:top-8 z-40 flex items-center justify-center w-8 h-12 bg-white/90 hover:bg-white dark:bg-[#0d141d]/90 dark:hover:bg-[#161f28] border-y border-l border-slate-200 dark:border-white/10 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-all duration-300 rounded-l-2xl backdrop-blur-md shadow-md cursor-pointer",
          isSidebarOpen ? "right-[296px] sm:right-84" : "right-2 sm:right-4"
        )}
        title={isSidebarOpen ? "Seitenleiste ausblenden" : "Seitenleiste einblenden"}
      >
        {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  )
}
