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
    <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#050a0f]/60 backdrop-blur-md shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        {!isLogin && (
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-slate-50">
          <img src="/favicon.svg" alt="Logo" className="h-8.5 w-8.5 md:h-9 md:w-9 object-contain" />
          <span className="hidden min-[380px]:inline-block">sm4sh's Urlaubsplaner</span>
        </Link>
      </div>


      {!isLogin && (
        <div className="hidden md:flex gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-inner backdrop-blur-md">
          <Link 
            href="/" 
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
              pathname === '/' 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
              pathname.startsWith('/calendar') 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            Kalenderansicht
          </Link>
          <Link 
            href="/statistics" 
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
              pathname.startsWith('/statistics') 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            Statistiken
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        {!isLogin && (
          <>
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-full p-1 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
              <button 
                onClick={() => {
                  if (selectedYear > 2022) setSelectedYear(selectedYear - 1)
                }}
                disabled={selectedYear <= 2022}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Vorheriges Jahr"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-xs md:text-sm px-2 text-center text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {selectedYear}
              </span>
              <button 
                onClick={() => {
                  const currentYear = new Date().getFullYear()
                  if (selectedYear < currentYear + 4) setSelectedYear(selectedYear + 1)
                }}
                disabled={selectedYear >= new Date().getFullYear() + 4}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Nächstes Jahr"
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
            <button 
              onClick={() => setIsHelpOpen(true)} 
              className="hidden md:flex p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs" 
              title="Hilfe"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <Link 
              href="/settings" 
              className="hidden md:flex p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs" 
              title="Einstellungen"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button 
              onClick={handleLogout} 
              className="hidden md:flex p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-all text-red-600 dark:text-red-400 cursor-pointer shadow-xs" 
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isLogin && isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl md:hidden flex flex-col p-4 gap-2 z-50 animate-in slide-in-from-top-2"
        >
          <Link 
            href="/" 
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === '/' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname.startsWith('/calendar') ? 'bg-brand-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Kalenderansicht
          </Link>
          <Link 
            href="/statistics" 
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname.startsWith('/statistics') ? 'bg-brand-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Statistiken
          </Link>
          
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
          
          <Link 
            href="/settings" 
            className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings className="h-5 w-5 text-brand-500" /> Einstellungen
          </Link>
          <button 
            onClick={() => { setIsHelpOpen(true); setIsMobileMenuOpen(false); }}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3 text-left w-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-brand-500" /> Hilfe
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-3 text-left w-full hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <LogOut className="h-5 w-5" /> Abmelden
          </button>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  )
}
