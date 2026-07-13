"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, Settings, ChevronLeft, ChevronRight, LogOut, HelpCircle, Menu, X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import ProfileSelector from "./ProfileSelector"
import HelpModal from "./HelpModal"
import { useStore } from "@/store/useStore"
import { usePathname, useRouter } from "next/navigation"
import { logout } from "@/app/actions"

export default function Navbar() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  const selectedYear = useStore((state) => state.selectedYear)
  const setSelectedYear = useStore((state) => state.setSelectedYear)
  const pathname = usePathname()
  const router = useRouter()

  const isLogin = pathname === '/login'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <nav className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800 shadow-sm z-50 shrink-0 relative">
      <div className="flex items-center gap-2">
        {!isLogin && (
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        <CalendarDays className="h-6 w-6 text-brand-500 hidden sm:block" />
        <Link href="/" className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-slate-50">
          sm4sh's Urlaubsplaner
        </Link>
      </div>

      {!isLogin && (
        <div className="hidden md:flex gap-1 bg-slate-100 dark:bg-[#1a222c] p-1 rounded-full border border-slate-200/80 dark:border-[#2a3441] shadow-inner">
          <Link 
            href="/" 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pathname === '/' ? 'bg-white text-brand-600 dark:bg-[#2a3644] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pathname.startsWith('/calendar') ? 'bg-white text-brand-600 dark:bg-[#2a3644] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Kalenderansicht
          </Link>
          <Link 
            href="/statistics" 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pathname.startsWith('/statistics') ? 'bg-white text-brand-600 dark:bg-[#2a3644] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Statistiken
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-4">
        {!isLogin && (
          <>
            <div className="flex items-center gap-1 md:gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-1 md:px-2 py-1">
              <button 
                onClick={() => {
                  if (selectedYear > 2022) setSelectedYear(selectedYear - 1)
                }}
                disabled={selectedYear <= 2022}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-xs md:text-sm w-10 md:w-12 text-center text-slate-700 dark:text-slate-200">
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
            <button onClick={() => setIsHelpOpen(true)} className="hidden md:block p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Hilfe">
              <HelpCircle className="h-5 w-5" />
            </button>
            <Link href="/settings" className="hidden md:block p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Einstellungen">
              <Settings className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} className="hidden md:block p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" title="Abmelden">
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isLogin && isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg md:hidden flex flex-col p-4 gap-2 z-50 animate-in slide-in-from-top-2"
        >
          <Link 
            href="/" 
            className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname.startsWith('/calendar') ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Kalenderansicht
          </Link>
          <Link 
            href="/statistics" 
            className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname.startsWith('/statistics') ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Statistiken
          </Link>
          
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
          
          <Link 
            href="/settings" 
            className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-3"
          >
            <Settings className="h-5 w-5" /> Einstellungen
          </Link>
          <button 
            onClick={() => { setIsHelpOpen(true); setIsMobileMenuOpen(false); }}
            className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-3 text-left w-full"
          >
            <HelpCircle className="h-5 w-5" /> Hilfe
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-3 text-left w-full"
          >
            <LogOut className="h-5 w-5" /> Abmelden
          </button>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </nav>
  )
}
