export type EntryType = 'U' | '2' | 'K' | '3' | 'Ü' | '4' | 'G' | 'D' | 'S' | 'X' | 'M' | '5' | 'A'

export interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  duration: number
  
  profiles: { id: string }[]
  externalParticipants?: string | null
  
  type: string
  status: string
  
  location?: string | null
  travelType?: string | null
  transport?: string | null
  notes?: string | null
  
  budget?: number | null
  cost?: number | null
  
  createdAt: string | Date
  updatedAt: string | Date
}

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
  workingDays: string
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
  trips: Trip[]
  holidays: Record<string, string>
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
  setTrips: (trips: Trip[]) => void
  setHolidays: (holidays: Record<string, string>) => void
  setSelectedYear: (year: number) => void
  toggleSidebar: () => void
  setActiveSidebarPanel: (panel: 'legend' | 'statistics') => void
}
