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

export function calculateTripVacationCost(trip: Trip, profile: Profile, holidays: Record<string, string>): number {
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

  // Parse working days from string "1,2,3,4,5"
  const workingDays = profile.workingDays ? profile.workingDays.split(',').map(Number) : [1, 2, 3, 4, 5]

  let cost = 0
  
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  
  // Create a loop from start date to end date
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // getDay() returns 0 for Sunday, 1 for Monday...
    // Let's normalize it to 1-7 where 1=Monday, 7=Sunday
    let dayOfWeek = d.getDay()
    if (dayOfWeek === 0) dayOfWeek = 7

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    if (!isVacationCostingDay(dateStr, profile, holidays)) {
      continue
    }

    // It's a working day and not a holiday, so it costs 1 vacation day
    cost += 1
  }

  return cost
}
