import { Profile, ProfileYearOverride, CalendarEntry, Trip } from "@/types"
import { calculateTripVacationCost, isVacationCostingDay, tripOverlapsYear } from "@/lib/tripUtils"

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
      let usedVacationBeforeExpiry = 0
      const expiryDateString = `${year - 1}-${profile.remainingLeaveExpiryDate}`

      prevEntries.forEach(e => {
        if (isVacationCostingDay(e.date, profile, holidays)) {
          let dayCost = 0
          e.type.split(',').forEach(part => {
            if (part === 'U') dayCost += 1
            if (part === '2') dayCost += 0.5
          })
          usedVacation += dayCost
          if (e.date <= expiryDateString) {
            usedVacationBeforeExpiry += dayCost
          }
        }
      })

      // Subtract trips in previous year
      const prevTrips = trips.filter(t => t.profiles.some(p => p.id === profile.id) && tripOverlapsYear(t, year - 1))
      prevTrips.forEach(t => {
        if (["In Planung", "Gebucht", "Abgeschlossen"].includes(t.status) && t.type === "Urlaub") {
          const start = new Date(t.startDate)
          const end = new Date(t.endDate)
          for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
            if (d.getUTCFullYear() !== year - 1) continue;
            
            const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0')
            const dayStr = String(d.getUTCDate()).padStart(2, '0')
            const dateStr = `${d.getUTCFullYear()}-${monthStr}-${dayStr}`
            
            if (isVacationCostingDay(dateStr, profile, holidays)) {
              usedVacation += 1
              if (dateStr <= expiryDateString) {
                usedVacationBeforeExpiry += 1
              }
            }
          }
        }
      })

      // Wie viel vom Resturlaub ist verfallen?
      const expiredLeave = Math.max(0, prevStats.remainingLeave - usedVacationBeforeExpiry)

      // Carry over is what is left from the effectively available days
      const effectiveAvailable = prevStats.totalAvailable - expiredLeave
      const carryOver = Math.max(0, effectiveAvailable - usedVacation)
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
