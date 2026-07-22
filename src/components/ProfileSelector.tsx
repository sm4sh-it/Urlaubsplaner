"use client"

import * as React from "react"
import { Users, Check } from "lucide-react"
import { useStore } from "@/store/useStore"

export default function ProfileSelector() {
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const toggleActiveProfile = useStore(state => state.toggleActiveProfile)
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm shadow-sm cursor-pointer backdrop-blur-md"
      >
        <Users className="h-4 w-4 text-brand-500" />
        <span>
          {activeProfileIds.length === 0 
            ? "Kein Profil aktiv" 
            : activeProfileIds.length === profiles.length 
              ? "Alle Profile" 
              : `${activeProfileIds.length} Profil(e) aktiv`}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Profile auswählen
            </div>
            {profiles.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">Keine Profile angelegt</div>
            ) : (
              profiles.map(profile => {
                const isActive = activeProfileIds.includes(profile.id)
                return (
                  <button
                    key={profile.id}
                    onClick={() => toggleActiveProfile(profile.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs shrink-0" style={{ backgroundColor: profile.color }} />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{profile.name}</span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-brand-500 font-bold" />}
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

