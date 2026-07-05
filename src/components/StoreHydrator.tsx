"use client"

"use client"

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { StoreState } from '@/types'
import { getCalendarData } from '@/app/actions'

export default function StoreHydrator({ 
  profiles, 
  entries,
  overrides = [],
  trips = []
}: { 
  profiles: StoreState['profiles'], 
  entries: StoreState['entries'],
  overrides?: StoreState['overrides'],
  trips?: StoreState['trips']
}) {
  const isHydrated = useRef(false)

  useEffect(() => {
    if (!isHydrated.current) {
      useStore.getState().setProfiles(profiles)
      useStore.getState().setEntries(entries)
      useStore.getState().setOverrides(overrides)
      useStore.getState().setTrips(trips)
      // Set the first profile as active by default if none is selected
      // Also prune any invalid active profiles (e.g. deleted from DB or DB was reset)
      const currentActive = useStore.getState().activeProfileIds
      const validActive = currentActive.filter(id => profiles.some(p => p.id === id))
      
      if (validActive.length !== currentActive.length) {
        useStore.getState().setActiveProfileIds(validActive)
      }

      if (validActive.length === 0 && profiles.length > 0) {
        useStore.getState().toggleActiveProfile(profiles[0].id)
      }
      isHydrated.current = true
    }
  }, [profiles, entries, overrides, trips])

  // Global Data Loader for Holidays
  const selectedYear = useStore(state => state.selectedYear)
  const activeProfileIds = useStore(state => state.activeProfileIds)
  const currentProfiles = useStore(state => state.profiles)
  
  useEffect(() => {
    async function loadData() {
      try {
        const primaryProfile = activeProfileIds.length > 0 
          ? currentProfiles.find(p => p.id === activeProfileIds[0])
          : null;
        const stateCode = primaryProfile?.stateCode || "NW"
        
        const data = await getCalendarData(selectedYear, stateCode)
        useStore.getState().setHolidays(data.holidays)
      } catch (e) {
        console.error("Failed to load calendar data", e)
      }
    }
    
    // Only load if hydrated and we have profiles
    if (isHydrated.current && currentProfiles.length > 0) {
      loadData()
    }
  }, [selectedYear, activeProfileIds, currentProfiles])

  return null
}
