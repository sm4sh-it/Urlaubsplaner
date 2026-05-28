import { Profile, ProfileYearOverride, CalendarEntry } from "@/types"

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
  entries: CalendarEntry[]
): YearlyStats | null {
  if (year < profile.startYear) return null

  const override = overrides.find(o => o.profileId === profile.id && o.year === year)
  
  let annualLeave = override?.annualLeave ?? profile.annualLeave
  let additionalLeave = override?.additionalLeave ?? profile.additionalLeave
  let remainingLeave = 0

  if (override?.remainingLeave != null) {
    // Manually overridden carry-over
    remainingLeave = override.remainingLeave
  } else if (year === profile.startYear) {
    // Base carry-over from profile settings
    remainingLeave = profile.remainingLeave
  } else {
    // Calculate recursively from the previous year
    const prevStats = getProfileStatsForYear(profile, year - 1, overrides, entries)
    if (prevStats) {
      // Find all used vacation in previous year
      const prevYearStr = (year - 1).toString()
      const prevEntries = entries.filter(e => e.profileId === profile.id && e.date.startsWith(prevYearStr))
      
      let usedVacation = 0
      prevEntries.forEach(e => {
        if (e.type === 'U') usedVacation += 1
        if (e.type === '2') usedVacation += 0.5
      })

      // Carry over is what is left
      const carryOver = Math.max(0, prevStats.totalAvailable - usedVacation)
      remainingLeave = carryOver
    }
  }

  return {
    annualLeave,
    additionalLeave,
    remainingLeave,
    totalAvailable: annualLeave + additionalLeave + remainingLeave
  }
}
