"use client"

import { Trip } from "@/types"
import { useStore } from "@/store/useStore"
import AvatarGroup from "@/components/ui/AvatarGroup"
import { Calendar } from "lucide-react"

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const allProfiles = useStore(state => state.profiles)

  const startDate = new Date(trip.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const endDate = new Date(trip.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Calculate days until trip
  const today = new Date()
  const start = new Date(trip.startDate)
  const diffTime = start.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let countdownText = ""
  if (diffDays < 0) {
    countdownText = "Vergangen"
  } else if (diffDays === 0) {
    countdownText = "Heute"
  } else if (diffDays < 30) {
    countdownText = `In ${diffDays} Tagen`
  } else {
    const diffMonths = Math.round(diffDays / 30)
    countdownText = `In ${diffMonths} ${diffMonths === 1 ? 'Monat' : 'Monaten'}`
  }

  const getStatusBadge = () => {
    switch (trip.status) {
      case "Gebucht":
        return "text-[#15803d] dark:text-[#23d160] bg-[#15803d]/10 dark:bg-[#23d160]/10 border-[#15803d]/25 dark:border-[#23d160]/20"
      case "In Planung":
        return "text-[#ea580c] dark:text-[#ff9f43] bg-[#ea580c]/10 dark:bg-[#ff9f43]/10 border-[#ea580c]/25 dark:border-[#ff9f43]/20"
      case "Idee":
        return "text-[#d97706] dark:text-[#facc15] bg-[#d97706]/10 dark:bg-[#facc15]/10 border-[#d97706]/25 dark:border-[#facc15]/20"
      case "Abgeschlossen":
      default:
        return "text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 dark:bg-[#38bdf8]/10 border-[#0284c7]/25 dark:border-[#38bdf8]/20"
    }
  }

  // Destination formatting
  const destinationParts = [trip.country, trip.location].filter(Boolean)
  const destination = destinationParts.length > 0 ? destinationParts.join(", ") : "Nicht festgelegt"
  const transportText = trip.transport || "Nicht festgelegt"

  // Duration text
  const durationText = trip.isHalfDay 
    ? (trip.duration === 1 ? "0.5 Tag" : `${trip.duration * 0.5} Tage`)
    : `${trip.duration} ${trip.duration === 1 ? 'Tag' : 'Tage'}`

  // Day type info string
  const dayTypeInfo = trip.isHalfDay 
    ? `Halber Tag (${trip.halfDayType === "NACHMITTAG" ? "Nachmittag" : "Vormittag"})` 
    : "Ganztägig"

  // Map trip profile IDs to full profile objects
  const tripProfiles = (trip.profiles || [])
    .map(pRef => allProfiles.find(p => p.id === pRef.id))
    .filter(Boolean) as { id: string; name: string; color: string }[]

  return (
    <div 
      className="card-interactive group relative flex flex-col justify-between gap-5" 
      onClick={onClick}
    >
      <div>
        {/* Header: Status & Countdown Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge()}`}>
            {trip.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/5 border border-brand-500/20 dark:border-brand-500/10">
            {countdownText}
          </span>
        </div>
        
        {/* Title & Dates */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate" title={trip.title}>
            {trip.title}
          </h4>
          <div className="flex items-center gap-1.5 text-sm font-medium font-mono text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{startDate} – {endDate}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {dayTypeInfo}
          </span>
        </div>
        
        {/* Meta Grid (Typografisch clean ohne Icons vor Werten) */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dauer</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{durationText}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Urlaubstyp</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{trip.travelType || trip.type}</span>
          </div>
          <div className="flex flex-col col-span-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ziel</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{destination}</span>
          </div>
          <div className="flex flex-col col-span-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Transport</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{transportText}</span>
          </div>
        </div>
      </div>

      {/* Footer mit Teilnehmenden */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-h-[36px]">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Teilnehmende:</span>
        {tripProfiles.length > 0 ? (
          <AvatarGroup profiles={tripProfiles} size="xs" max={3} />
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        )}
      </div>
    </div>
  )
}

