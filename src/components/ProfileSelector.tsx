"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { useStore } from "@/store/useStore"
import Avatar from "@/components/ui/Avatar"
import AvatarGroup from "@/components/ui/AvatarGroup"

export default function ProfileSelector() {
  const profiles = useStore(state => state.profiles)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const toggleActiveProfile = useStore(state => state.toggleActiveProfile)
  const [isOpen, setIsOpen] = React.useState(false)

  const activeProfiles = profiles.filter(p => activeProfileIds.includes(p.id))

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-1 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
        title="Profile filtern"
      >
        {activeProfiles.length > 0 ? (
          <AvatarGroup profiles={activeProfiles} size="xs" max={2} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-[9px] font-bold">
            0
          </div>
        )}
        <span>
          {activeProfileIds.length === 0 
            ? "Kein Profil aktiv" 
            : activeProfileIds.length === profiles.length 
              ? `Alle Profile (${profiles.length})` 
              : `${activeProfileIds.length} von ${profiles.length} aktiv`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-[#0d141d]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                    className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-brand-500/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={profile.name} color={profile.color} size="xs" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.name}</span>
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

