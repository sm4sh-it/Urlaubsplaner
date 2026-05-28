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
        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Users className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium">
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
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 py-1">
            {profiles.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">Keine Profile angelegt</div>
            ) : (
              profiles.map(profile => {
                const isActive = activeProfileIds.includes(profile.id)
                return (
                  <button
                    key={profile.id}
                    onClick={() => toggleActiveProfile(profile.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }} />
                      <span>{profile.name}</span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-emerald-600" />}
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

