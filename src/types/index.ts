export type EntryType = 'U' | '2' | 'K' | '3' | 'Ü' | 'G' | 'D' | 'S' | 'X'

export interface Profile {
  id: string
  name: string
  color: string
  annualLeave: number
  remainingLeave: number
  additionalLeave: number
  remainingLeaveExpiryDate: string
  stateCode: string
  startYear: number
}

export interface ProfileYearOverride {
  id: string
  year: number
  annualLeave: number | null
  additionalLeave: number | null
  remainingLeave: number | null
  profileId: string
}

export interface CalendarEntry {
  id: string
  date: string
  type: EntryType
  profileId: string
}

export interface StoreState {
  profiles: Profile[]
  activeProfileIds: string[]
  entries: CalendarEntry[]
  overrides: ProfileYearOverride[]
  selectedYear: number
  
  // Actions
  setProfiles: (profiles: Profile[]) => void
  setOverrides: (overrides: ProfileYearOverride[]) => void
  toggleActiveProfile: (id: string) => void
  setActiveProfileIds: (ids: string[]) => void
  setEntries: (entries: CalendarEntry[]) => void
  addOrUpdateEntry: (entry: CalendarEntry) => void
  removeEntry: (id: string) => void
  setSelectedYear: (year: number) => void
}
