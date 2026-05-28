"use client"

import { create } from 'zustand'
import { StoreState, Profile, CalendarEntry } from '@/types'

export const useStore = create<StoreState>((set) => ({
  profiles: [],
  activeProfileIds: [],
  entries: [],
  overrides: [],
  selectedYear: new Date().getFullYear(),

  setProfiles: (profiles) => set({ profiles }),
  setOverrides: (overrides) => set({ overrides }),
  
  toggleActiveProfile: (id) => set((state) => ({
    activeProfileIds: state.activeProfileIds.includes(id)
      ? state.activeProfileIds.filter(pId => pId !== id)
      : [...state.activeProfileIds, id]
  })),
  
  setEntries: (entries) => set({ entries }),
  
  addOrUpdateEntry: (entry) => set((state) => {
    // If an entry for this date and profile already exists, replace it
    const existingIndex = state.entries.findIndex(
      e => e.date === entry.date && e.profileId === entry.profileId
    )
    
    if (existingIndex >= 0) {
      const newEntries = [...state.entries]
      newEntries[existingIndex] = entry
      return { entries: newEntries }
    }
    
    return { entries: [...state.entries, entry] }
  }),
  
  removeEntry: (id) => set((state) => ({
    entries: state.entries.filter(e => e.id !== id)
  })),
  
  setSelectedYear: (selectedYear) => set({ selectedYear })
}))
