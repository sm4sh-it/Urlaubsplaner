import { Profile } from "@/types"

/**
 * Escapes characters for RFC 5545 iCalendar compliance
 */
function escapeIcsText(text: string): string {
  if (!text) return ""
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n")
}

/**
 * Returns the next day formatted as YYYYMMDD in UTC (exclusive DTEND in RFC 5545 for all-day events)
 */
function getNextDayIcsDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number)
  const y = parts[0]
  const m = parts[1] || 1
  const d = parts[2] || 1
  const nextDate = new Date(Date.UTC(y, m - 1, d + 1))
  const yStr = nextDate.getUTCFullYear()
  const mStr = String(nextDate.getUTCMonth() + 1).padStart(2, "0")
  const dStr = String(nextDate.getUTCDate()).padStart(2, "0")
  return `${yStr}${mStr}${dStr}`
}

/**
 * Formats YYYY-MM-DD into YYYYMMDD
 */
function formatIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, "")
}

/**
 * Cleans filenames for downloads
 */
function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[/\\?%*:|"<>]/g, "-")
      .replace(/\s+/g, "_") || "Reise"
  )
}

export interface IcsTripData {
  id?: string
  title: string
  startDate: string
  endDate?: string | null
  type?: string
  status?: string
  location?: string | null
  country?: string | null
  travelType?: string | null
  transport?: string | string[] | null
  notes?: string | null
  selectedProfileIds?: string[]
  profiles?: { id: string; name?: string }[]
  externalParticipants?: string | null
}

/**
 * Generates an RFC 5545 compliant .ics string for a given trip
 */
export function generateTripIcs(trip: IcsTripData, allProfiles: Profile[] = []): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const uid = `trip-${trip.id || Date.now()}@sm4sh-urlaubsplaner`

  const dtStart = formatIcsDate(trip.startDate)
  const lastDate = trip.endDate || trip.startDate
  const dtEnd = getNextDayIcsDate(lastDate)

  // Determine Location
  const locationParts = [trip.location, trip.country].filter(Boolean)
  const locationString = locationParts.join(", ")

  // Determine Participants
  const participantNames: string[] = []
  
  if (trip.selectedProfileIds && trip.selectedProfileIds.length > 0) {
    trip.selectedProfileIds.forEach((id) => {
      const p = allProfiles.find((prof) => prof.id === id)
      if (p && p.id !== "ALLE_FERIEN") {
        participantNames.push(p.name)
      }
    })
  } else if (trip.profiles && trip.profiles.length > 0) {
    trip.profiles.forEach((p) => {
      const match = allProfiles.find((prof) => prof.id === p.id)
      if (match && match.id !== "ALLE_FERIEN") {
        participantNames.push(match.name)
      } else if (p.name && p.id !== "ALLE_FERIEN") {
        participantNames.push(p.name)
      }
    })
  }

  if (trip.externalParticipants) {
    participantNames.push(trip.externalParticipants)
  }

  // Determine Transport
  let transportString = ""
  if (Array.isArray(trip.transport)) {
    transportString = trip.transport.filter(Boolean).join(", ")
  } else if (typeof trip.transport === "string") {
    transportString = trip.transport
  }

  // Build Structured Description
  const descLines: string[] = []
  if (trip.status) descLines.push(`Status: ${trip.status}`)
  if (trip.type) descLines.push(`Kategorie: ${trip.type}`)
  if (trip.travelType) descLines.push(`Reiseart: ${trip.travelType}`)
  if (transportString) descLines.push(`Transport: ${transportString}`)
  if (participantNames.length > 0) descLines.push(`Teilnehmer: ${participantNames.join(", ")}`)
  
  if (trip.notes && trip.notes.trim()) {
    descLines.push("")
    descLines.push("Notizen:")
    descLines.push(trip.notes.trim())
  }

  const descriptionText = descLines.join("\n")

  // Determine ICS Status
  let icsStatus = "CONFIRMED"
  if (trip.status === "Idee" || trip.status === "In Planung") {
    icsStatus = "TENTATIVE"
  } else if (trip.status === "Abgeschlossen" || trip.status === "Gebucht") {
    icsStatus = "CONFIRMED"
  }

  // Construct ICS Lines (CRLF line endings required by RFC 5545)
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//sm4sh//Urlaubsplaner//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcsText(trip.title)}`,
    `STATUS:${icsStatus}`,
  ]

  if (locationString) {
    lines.push(`LOCATION:${escapeIcsText(locationString)}`)
  }

  if (descriptionText) {
    lines.push(`DESCRIPTION:${escapeIcsText(descriptionText)}`)
  }

  lines.push("END:VEVENT")
  lines.push("END:VCALENDAR")

  return lines.join("\r\n")
}

/**
 * Triggers client-side browser download for a trip's .ics file
 */
export function downloadTripIcs(trip: IcsTripData, allProfiles: Profile[] = []): string {
  const icsContent = generateTripIcs(trip, allProfiles)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const filename = `${sanitizeFilename(trip.title || "Reise")}.ics`

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return filename
}
