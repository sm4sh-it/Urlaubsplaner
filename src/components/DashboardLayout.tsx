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
    <div className="flex flex-1 h-full relative overflow-hidden">
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
          "absolute top-4 z-10 p-2 rounded-l-lg bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
          isSidebarOpen ? "right-80 mr-4" : "right-0"
        )}
        title={isSidebarOpen ? "Seitenleiste ausblenden" : "Seitenleiste einblenden"}
      >
        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  )
}
