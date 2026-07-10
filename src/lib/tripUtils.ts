import { Trip, Profile } from "@/types"

export function isVacationCostingDay(dateStr: string, profile: Profile, holidays: Record<string, string>): boolean {
  // Parse working days from string "1,2,3,4,5"
  const workingDays = profile.workingDays ? profile.workingDays.split(',').map(Number) : [1, 2, 3, 4, 5]
  
  const d = new Date(dateStr)
  let dayOfWeek = d.getDay()
  if (dayOfWeek === 0) dayOfWeek = 7

  if (!workingDays.includes(dayOfWeek)) {
    return false
  }

  if (holidays[dateStr]) {
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

export function calculateTripVacationCost(trip: Trip, profile: Profile, holidays: Record<string, string>, targetYear?: number): number {
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

    if (!isVacationCostingDay(dateStr, profile, holidays)) {
      continue
    }

    cost += 1
  }

  return cost
}
