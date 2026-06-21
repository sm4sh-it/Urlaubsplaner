export type EntryType = 'U' | '2' | 'K' | '3' | 'Ü' | '4' | 'G' | 'D' | 'S' | 'X' | 'M' | '5'

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
  isSidebarOpen: boolean
  activeSidebarPanel: 'legend' | 'statistics'
  
  // Actions
  setProfiles: (profiles: Profile[]) => void
  setOverrides: (overrides: ProfileYearOverride[]) => void
  toggleActiveProfile: (id: string) => void
  setActiveProfileIds: (ids: string[]) => void
  setEntries: (entries: CalendarEntry[]) => void
  addOrUpdateEntry: (entry: CalendarEntry) => void
  removeEntry: (id: string) => void
  setSelectedYear: (year: number) => void
  toggleSidebar: () => void
  setActiveSidebarPanel: (panel: 'legend' | 'statistics') => void
}
