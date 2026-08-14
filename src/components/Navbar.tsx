"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, Settings, ChevronLeft, ChevronRight, LogOut, HelpCircle, Menu, X, Users, Check } from "lucide-react"
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
  const profiles = useStore((state) => state.profiles) || []
  const activeProfileIds = useStore((state) => state.activeProfileIds) || []
  const toggleActiveProfile = useStore((state) => state.toggleActiveProfile)
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
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menü öffnen"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg md:text-xl tracking-tight">
          <img src="/logo.svg" alt="Logo" className="h-8.5 w-8.5 md:h-9 md:w-9 object-contain" />
          <span className="hidden sm:inline-block font-bold">
            <span className="text-brand-600 dark:text-brand-500">sm4sh's</span>{" "}
            <span className="text-slate-700 dark:text-slate-200">Urlaubsplaner</span>
          </span>
        </Link>
      </div>


      {!isLogin && (
        <div className="hidden md:flex items-center gap-8 h-16">
          <Link 
            href="/" 
            className={`relative h-16 flex items-center text-sm font-semibold transition-colors ${
              pathname === '/' 
                ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-500 after:rounded-full' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/calendar" 
            className={`relative h-16 flex items-center text-sm font-semibold transition-colors ${
              pathname.startsWith('/calendar') 
                ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-500 after:rounded-full' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Kalenderansicht
          </Link>
          <Link 
            href="/budget" 
            className={`relative h-16 flex items-center text-sm font-semibold transition-colors ${
              pathname.startsWith('/budget') 
                ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-500 after:rounded-full' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Budget
          </Link>
          <Link 
            href="/statistics" 
            className={`relative h-16 flex items-center text-sm font-semibold transition-colors ${
              pathname.startsWith('/statistics') 
                ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-500 after:rounded-full' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Statistiken
          </Link>
        </div>
      )}

      <div className="flex items-center gap-1 md:gap-1.5">
        {!isLogin && (
          <>
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-sm">
              <button 
                onClick={() => {
                  if (selectedYear > 2022) setSelectedYear(selectedYear - 1)
                }}
                disabled={selectedYear <= 2022}
                className="p-2 md:p-1 hover:text-brand-600 dark:hover:text-brand-400 active:scale-95 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                title="Vorheriges Jahr"
              >
                <ChevronLeft className="w-5.5 h-5.5 md:w-4.5 md:h-4.5" />
              </button>
              <span className="font-bold px-1.5 md:px-1 tracking-tight text-sm md:text-sm">
                {selectedYear}
              </span>
              <button 
                onClick={() => {
                  const currentYear = new Date().getFullYear()
                  if (selectedYear < currentYear + 4) setSelectedYear(selectedYear + 1)
                }}
                disabled={selectedYear >= new Date().getFullYear() + 4}
                className="p-2 md:p-1 hover:text-brand-600 dark:hover:text-brand-400 active:scale-95 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                title="Nächstes Jahr"
              >
                <ChevronRight className="w-5.5 h-5.5 md:w-4.5 md:h-4.5" />
              </button>
            </div>

            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 shrink-0" />

            <div className="hidden md:block">
              <ProfileSelector />
            </div>

            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 shrink-0" />
          </>
        )}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        {!isLogin && (
          <>
            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 shrink-0" />

            <button 
              onClick={() => setIsHelpOpen(true)} 
              className="hidden md:flex p-1.5 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:scale-110 transition-all cursor-pointer" 
              title="Hilfe"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 shrink-0" />

            <Link 
              href="/settings" 
              className="hidden md:flex p-1.5 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:scale-110 transition-all cursor-pointer" 
              title="Einstellungen"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 shrink-0" />

            <button 
              onClick={handleLogout} 
              className="hidden md:flex p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer" 
              title="Abmelden"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isLogin && isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl md:hidden flex flex-col p-4 gap-2 z-[100] animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          {/* Hauptnavigation */}
          <div className="flex flex-col gap-0.5">
            <Link 
              href="/" 
              className={`px-3 py-2.5 text-sm transition-all flex items-center justify-between ${
                pathname === '/' 
                  ? 'text-brand-600 dark:text-brand-400 font-bold border-l-2 border-brand-500 pl-3' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/calendar" 
              className={`px-3 py-2.5 text-sm transition-all flex items-center justify-between ${
                pathname.startsWith('/calendar') 
                  ? 'text-brand-600 dark:text-brand-400 font-bold border-l-2 border-brand-500 pl-3' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              Kalenderansicht
            </Link>
            <Link 
              href="/budget" 
              className={`px-3 py-2.5 text-sm transition-all flex items-center justify-between ${
                pathname.startsWith('/budget') 
                  ? 'text-brand-600 dark:text-brand-400 font-bold border-l-2 border-brand-500 pl-3' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              Budget
            </Link>
            <Link 
              href="/statistics" 
              className={`px-3 py-2.5 text-sm transition-all flex items-center justify-between ${
                pathname.startsWith('/statistics') 
                  ? 'text-brand-600 dark:text-brand-400 font-bold border-l-2 border-brand-500 pl-3' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              Statistiken
            </Link>
          </div>
          
          <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1" />

          {/* Profil-Auswahl auf Mobile */}
          {profiles.length > 0 && (
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1">
                <Users className="h-3.5 w-3.5 text-brand-500" />
                <span>Profile ({activeProfileIds.length}/{profiles.length} aktiv)</span>
              </div>
              {profiles.map(profile => {
                const isActive = activeProfileIds.includes(profile.id)
                return (
                  <button
                    key={profile.id}
                    onClick={() => toggleActiveProfile(profile.id)}
                    className={`flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer ${
                      isActive 
                        ? 'text-slate-900 dark:text-slate-100 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: profile.color }} />
                      <span>{profile.name}</span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-brand-500 font-bold" />}
                  </button>
                )
              })}
            </div>
          )}

          <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1" />
          
          {/* Neben-Aktionen & Theme */}
          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Design-Modus</span>
            <ThemeToggle />
          </div>
          <Link 
            href="/settings" 
            className="px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-3 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Settings className="h-5 w-5 text-slate-400" /> Einstellungen
          </Link>
          <button 
            onClick={() => { setIsHelpOpen(true); setIsMobileMenuOpen(false); }}
            className="px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-3 text-left w-full hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-slate-400" /> Hilfe
          </button>
          <button 
            onClick={handleLogout}
            className="px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-3 text-left w-full hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" /> Abmelden
          </button>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  )
}

