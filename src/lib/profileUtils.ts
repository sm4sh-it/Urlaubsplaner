import { Profile, ProfileYearOverride, CalendarEntry, Trip } from "@/types"
import { calculateTripVacationCost, isVacationCostingDay } from "@/lib/tripUtils"

export interface YearlyStats {
  annualLeave: number
  additionalLeave: number
  remainingLeave: number
  totalAvailable: number
}

export function getProfileStatsForYear(
  profile: Profile,
  year: number,
  overrides: ProfileYearOverride[],
  entries: CalendarEntry[],
  trips: Trip[] = [],
  holidays: Record<string, any> = {},
  cache: Map<string, YearlyStats | null> = new Map()
): YearlyStats | null {
  const startYear = profile.startYear ?? 2022
  // Prevent infinite recursion by enforcing a hard minimum year limit (2020)
  if (year < startYear || year < 2020) return null

  const cacheKey = `${profile.id}_${year}`
  if (cache.has(cacheKey)) return cache.get(cacheKey) || null

  const override = overrides.find(o => o.profileId === profile.id && o.year === year)
  
  let annualLeave = override?.annualLeave ?? profile.annualLeave
  let additionalLeave = override?.additionalLeave ?? profile.additionalLeave
  let remainingLeave = 0

  if (override?.remainingLeave != null) {
    // Manually overridden carry-over
    remainingLeave = override.remainingLeave
  } else if (year === startYear) {
    // Base carry-over from profile settings
    remainingLeave = profile.remainingLeave
  } else {
    // Calculate recursively from the previous year
    const prevStats = getProfileStatsForYear(profile, year - 1, overrides, entries, trips, holidays, cache)
    if (prevStats) {
      // Find all used vacation in previous year
      const prevYearStr = (year - 1).toString()
      const prevEntries = entries.filter(e => e.profileId === profile.id && e.date.startsWith(prevYearStr))
      
      let usedVacation = 0
      prevEntries.forEach(e => {
        if (isVacationCostingDay(e.date, profile, holidays)) {
          if (e.type === 'U') usedVacation += 1
          if (e.type === '2') usedVacation += 0.5
        }
      })

      // Subtract trips in previous year
      const prevTrips = trips.filter(t => t.profiles.some(p => p.id === profile.id) && t.startDate.startsWith(prevYearStr))
      prevTrips.forEach(t => {
        usedVacation += calculateTripVacationCost(t, profile, holidays)
      })

      // Carry over is what is left
      const carryOver = Math.max(0, prevStats.totalAvailable - usedVacation)
      remainingLeave = carryOver
    }
  }

  const result = {
    annualLeave,
    additionalLeave,
    remainingLeave,
    totalAvailable: annualLeave + additionalLeave + remainingLeave
  }
  
  cache.set(cacheKey, result)
  return result
}
