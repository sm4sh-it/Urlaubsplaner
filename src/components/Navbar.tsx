"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, Settings, ChevronLeft, ChevronRight, LogOut, HelpCircle } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import ProfileSelector from "./ProfileSelector"
import HelpModal from "./HelpModal"
import { useStore } from "@/store/useStore"
import { usePathname, useRouter } from "next/navigation"
import { logout } from "@/app/actions"

export default function Navbar() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const selectedYear = useStore((state) => state.selectedYear)
  const setSelectedYear = useStore((state) => state.setSelectedYear)
  const pathname = usePathname()
  const router = useRouter()

  const isLogin = pathname === '/login'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50 shrink-0 relative">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-brand-500" />
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-50">
          sm4shReisen <span className="text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">| Urlaubsplaner</span>
        </Link>
      </div>

      {!isLogin && (
        <div className="hidden md:flex gap-2 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200 dark:border-slate-800">
          <Link 
            href="/" 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === '/' ? 'bg-brand-500 text-white shadow-[0_4px_12px_var(--color-brand-glow)]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname.startsWith('/calendar') ? 'bg-brand-500 text-white shadow-[0_4px_12px_var(--color-brand-glow)]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Kalenderansicht
          </Link>
        </div>
      )}

      <div className="flex items-center gap-4">
        {!isLogin && (
          <>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">
              <button 
                onClick={() => {
                  if (selectedYear > 2022) setSelectedYear(selectedYear - 1)
                }}
                disabled={selectedYear <= 2022}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-sm w-12 text-center text-slate-700 dark:text-slate-200">
                {selectedYear}
              </span>
              <button 
                onClick={() => {
                  const currentYear = new Date().getFullYear()
                  if (selectedYear < currentYear + 4) setSelectedYear(selectedYear + 1)
                }}
                disabled={selectedYear >= new Date().getFullYear() + 4}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <ProfileSelector />
          </>
        )}
        <ThemeToggle />
        {!isLogin && (
          <>
            <button onClick={() => setIsHelpOpen(true)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Hilfe">
              <HelpCircle className="h-5 w-5" />
            </button>
            <Link href="/settings" className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Einstellungen">
              <Settings className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Abmelden">
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </nav>
  )
}
