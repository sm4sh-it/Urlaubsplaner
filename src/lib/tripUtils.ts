import { Trip, Profile } from "@/types"

export function isVacationCostingDay(dateStr: string, profile: Profile, holidays: Record<string, string> = {}): boolean {
  // Parse working days from string "1,2,3,4,5" or array if provided
  const rawWorkingDays = (profile as any).workingDays
  const workingDays = Array.isArray(rawWorkingDays)
    ? rawWorkingDays
    : (typeof rawWorkingDays === 'string' ? rawWorkingDays.split(',').map(Number) : [1, 2, 3, 4, 5])
  
  const parts = dateStr.split('-')
  if (parts.length !== 3) return false
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)

  const d = new Date(Date.UTC(year, month, day))
  let dayOfWeek = d.getUTCDay()
  if (dayOfWeek === 0) dayOfWeek = 7

  if (!workingDays.includes(dayOfWeek)) {
    return false
  }

  if (holidays && holidays[dateStr]) {
    return false
  }

  return true
}

export function tripOverlapsYear(trip: Trip, year: number): boolean {
  if (!trip.startDate || !trip.endDate) return false
  const startYear = parseInt(trip.startDate.split('-')[0], 10)
  const endYear = parseInt(trip.endDate.split('-')[0], 10)
  return year >= startYear && year <= endYear
}

export function getTripDayVacationCost(
  trip: Trip,
  dateStr: string,
  profile: Profile,
  holidays: Record<string, string> = {},
  entries?: { profileId: string; date: string; type: string }[]
): number {
  if (!isVacationCostingDay(dateStr, profile, holidays)) {
    return 0
  }

  // Check if illness overrides vacation on this day (Krankheit bricht Urlaub)
  if (entries) {
    const isSick = entries.some(
      e => e.profileId === profile.id && e.date === dateStr && (e.type.includes('K') || e.type.includes('3'))
    )
    if (isSick) {
      return 0
    }
  }

  const isStart = dateStr === trip.startDate
  const isEnd = dateStr === trip.endDate

  if (isStart && trip.startDayType === "NONE") {
    return 0
  }
  if (isStart && trip.startDayType === "HALF") {
    return 0.5
  }
  if (isEnd && trip.endDayType === "NONE") {
    return 0
  }
  if (isEnd && trip.endDayType === "HALF") {
    return 0.5
  }

  return trip.isHalfDay ? 0.5 : 1
}

export function calculateTripVacationCost(
  trip: Trip,
  profile: Profile,
  holidays: Record<string, string> = {},
  targetYear?: number,
  entries?: { profileId: string; date: string; type: string }[]
): number {
  const validTripStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
  if (!validTripStatuses.includes(trip.status)) {
    return 0
  }

  const validTypes = ["Urlaub"]
  // "Mobiles Arbeiten", "Sonderurlaub", "Sabbatical" and "Überstundenabbau" cost 0 vacation days.
  // For the purpose of deducting vacation budget, we only care about real vacation types.
  if (!validTypes.includes(trip.type)) {
    return 0
  }

  let cost = 0
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  
  // Use UTC to avoid daylight saving time skips in different timezones!
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const year = d.getUTCFullYear()
    if (targetYear && year !== targetYear) continue;

    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    cost += getTripDayVacationCost(trip, dateStr, profile, holidays, entries)
  }

  return cost
}
