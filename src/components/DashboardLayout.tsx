"use client"

import * as React from "react"
import { useStore } from "@/store/useStore"
import { PanelRightOpen } from "lucide-react"
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
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        useStore.setState({ isSidebarOpen: false })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-1 h-full relative overflow-hidden p-3 sm:p-4 pt-3 sm:pt-4">
      {/* Calendar View Area */}
      <div className={cn(
        "flex-1 flex min-w-0 transition-all duration-300 ease-in-out relative",
        isSidebarOpen ? "mr-2 md:mr-4" : "mr-0"
      )}>
        {calendar}

        {/* Sleek Floating Open Button aligned with header line */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-1.5 sm:top-2 md:top-3 right-2 sm:right-4 md:right-6 z-30 btn-glass inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md py-1 px-2.5 sm:py-1.5 sm:px-3 hover:scale-105 active:scale-95 transition-all cursor-pointer rounded-xl"
            title="Seitenleiste einblenden (Statistik & Legende)"
            aria-label="Seitenleiste einblenden"
          >
            <PanelRightOpen size={15} className="text-brand-500 shrink-0" />
            <span className="hidden sm:inline">Info &amp; Legende</span>
          </button>
        )}
      </div>
      
      {/* Sidebar Container */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out shrink-0 z-30 h-full",
          isSidebarOpen ? "w-72 sm:w-80 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"
        )}
      >
        <div className="w-72 sm:w-80 h-full flex flex-col min-h-0">
          {sidebar}
        </div>
      </div>
    </div>
  )
}

