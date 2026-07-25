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
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
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
          "absolute top-4 sm:top-8 z-40 flex items-center justify-center w-8 h-12 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-all duration-300 rounded-l-xl backdrop-blur-md shadow-md cursor-pointer",
          isSidebarOpen ? "right-[296px] sm:right-84" : "right-2 sm:right-4"
        )}
        title={isSidebarOpen ? "Seitenleiste ausblenden" : "Seitenleiste einblenden"}
      >
        {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  )
}
