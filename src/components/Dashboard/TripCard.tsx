"use client"

import { Trip } from "@/types"

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

export default function TripCard({ trip, onClick }: TripCardProps) {
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

  const isConfirmed = trip.status === "Gebucht" || trip.status === "Abgeschlossen"
  const isIdea = trip.status === "Idee"
  
  let statusClass = "status-badge planning" // default to In Planung (Orange)
  if (isConfirmed) {
    statusClass = "status-badge confirmed" // Green
  } else if (isIdea) {
    statusClass = "status-badge request" // Yellow
  }

  // Destination formatting
  const destinationParts = [trip.country, trip.location].filter(Boolean)
  const destination = destinationParts.length > 0 ? destinationParts.join(", ") : "Nicht festgelegt"
  const transportText = trip.transport || "Nicht festgelegt"

  // Duration text (Reisezeitraum in ganzen Kalendertagen)
  const durationText = `${trip.duration} ${trip.duration === 1 ? 'Tag' : 'Tage'}`

  // Day type info string
  const dayTypeInfo = trip.isHalfDay 
    ? `Halber Tag (${trip.halfDayType === "NACHMITTAG" ? "Nachmittag" : "Vormittag"})` 
    : "Ganztägig"

  return (
    <div className="vacation-card min-w-0" onClick={onClick}>
      <div className="card-header">
        <span className={statusClass}>{trip.status}</span>
        <span className="countdown-badge">{countdownText}</span>
      </div>
      
      <div className="card-title-group min-w-0 flex flex-col gap-1">
        <h3 className="truncate" title={trip.title}>{trip.title}</h3>
        <span className="date-range block">{startDate} - {endDate}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
          {dayTypeInfo}
        </span>
      </div>
      
      <div className="card-meta-grid">
        <div className="meta-item min-w-0">
          <span className="meta-label">Dauer</span>
          <span className="meta-value truncate" title={durationText}>{durationText}</span>
        </div>
        <div className="meta-item min-w-0">
          <span className="meta-label">Typ</span>
          <span className="meta-value truncate" title={trip.type}>{trip.type}</span>
        </div>
        <div className="meta-item col-span-2 min-w-0">
          <span className="meta-label">Ziel</span>
          <span className="meta-value truncate block max-w-full" title={destination}>{destination}</span>
        </div>
        <div className="meta-item col-span-2 min-w-0">
          <span className="meta-label">Transport</span>
          <span className="meta-value truncate block max-w-full" title={transportText}>{transportText}</span>
        </div>
      </div>
    </div>
  )
}
