// EntryType is a string that can contain comma-separated values like '2,5' for stacked half-days
export type EntryType = string // Was: 'U' | '2' | 'K' | '3' | 'Ü' | '4' | 'G' | 'D' | 'S' | 'X' | 'M' | '5' | 'A' | '6'

export type TripType = "Urlaub" | "Mobiles Arbeiten" | "Sabbatical" | "Sonderurlaub" | "Überstundenabbau"
export type TripStatus = "Idee" | "In Planung" | "Gebucht" | "Abgeschlossen"

export interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  duration: number
  
  profiles: { id: string }[]
  externalParticipants?: string | null
  
  type: TripType
  status: TripStatus
  
  location?: string | null
  country?: string | null
  travelType?: string | null
  transport?: string | null
  notes?: string | null
  
  budget?: number | null
  cost?: number | null
  
  isHalfDay?: boolean
  halfDayType?: string | null
  
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

// --- Budget Module Interfaces ---

export interface BudgetParticipant {
  id: string
  budgetId: string
  profileId?: string | null
  profile?: Profile | null
  name: string
  color?: string | null
}

export interface BudgetCategory {
  id: string
  budgetId?: string | null
  name: string
  icon?: string | null
  color?: string | null
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  participantId: string
  participant?: BudgetParticipant
  amount: number
}

export interface BudgetExpense {
  id: string
  budgetId: string
  title: string
  amount: number
  date: string // YYYY-MM-DD
  notes?: string | null
  categoryId?: string | null
  category?: BudgetCategory | null
  payerId: string
  payer: BudgetParticipant
  splits: ExpenseSplit[]
  createdAt: string | Date
}

export interface TripBudget {
  id: string
  name: string
  currency: string
  totalBudget?: number | null
  startDate?: string | null
  endDate?: string | null
  tripId?: string | null
  trip?: Trip | null
  participants: BudgetParticipant[]
  expenses: BudgetExpense[]
  categories: BudgetCategory[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface ParticipantBalance {
  participant: BudgetParticipant
  totalPaid: number
  totalShare: number
  netBalance: number
}

export interface DebtSettlement {
  from: BudgetParticipant
  to: BudgetParticipant
  amount: number
}

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export interface StoreState {
  profiles: Profile[]
  activeProfileIds: string[]
  entries: CalendarEntry[]
  overrides: ProfileYearOverride[]
  trips: Trip[]
  holidays: Record<string, string>
  vacations: {start: string, end: string, name: string, stateCode?: string}[]
  selectedYear: number
  isSidebarOpen: boolean
  activeSidebarPanel: 'legend' | 'statistics'
  toasts: ToastMessage[]
  
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
  setVacations: (vacations: {start: string, end: string, name: string, stateCode?: string}[]) => void
  setSelectedYear: (year: number) => void
  toggleSidebar: () => void
  setActiveSidebarPanel: (panel: 'legend' | 'statistics') => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

