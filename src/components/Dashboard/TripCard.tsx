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
  
  let statusClass = "status-badge request"
  if (isConfirmed) {
    statusClass = "status-badge confirmed"
  } else if (isIdea) {
    statusClass = "status-badge planning"
  }

  return (
    <div className="vacation-card" onClick={onClick}>
      <div className="card-header">
        <span className={statusClass}>{trip.status}</span>
        <span className="countdown-badge">{countdownText}</span>
      </div>
      
      <div className="card-title-group">
        <h3>{trip.title}</h3>
        <span className="date-range">{startDate} - {endDate}</span>
      </div>
      
      <div className="card-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Dauer</span>
          <span className="meta-value">{trip.duration} Tage</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Typ</span>
          <span className="meta-value truncate">{trip.type}</span>
        </div>
        <div className="meta-item" style={{ gridColumn: 'span 2' }}>
          <span className="meta-label">Ziel & Transport</span>
          <span className="meta-value truncate">
            {trip.location || "Nicht festgelegt"} {trip.transport ? `(${trip.transport})` : ""}
          </span>
        </div>
      </div>
    </div>
  )
}
