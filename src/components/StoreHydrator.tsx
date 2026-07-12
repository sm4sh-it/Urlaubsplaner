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
      const allFerienProfile = {
        id: 'ALLE_FERIEN',
        name: 'AlleFerien',
        color: '#ffce00', // Gold color as requested
        annualLeave: 0,
        remainingLeave: 0,
        additionalLeave: 0,
        remainingLeaveExpiryDate: "03-31",
        stateCode: "ALL",
        startYear: new Date().getFullYear(),
        workingDays: "1,2,3,4,5",
        createdAt: new Date(),
        updatedAt: new Date()
      } as StoreState['profiles'][0]
      
      const combinedProfiles = [...profiles, allFerienProfile]
      
      useStore.getState().setProfiles(combinedProfiles)
      useStore.getState().setEntries(entries)
      useStore.getState().setOverrides(overrides)
      useStore.getState().setTrips(trips)
      // Set the first profile as active by default if none is selected
      // Also prune any invalid active profiles (e.g. deleted from DB or DB was reset)
      const currentActive = useStore.getState().activeProfileIds
      const validActive = currentActive.filter(id => combinedProfiles.some(p => p.id === id))
      
      if (validActive.length !== currentActive.length) {
        useStore.getState().setActiveProfileIds(validActive)
      }

      if (validActive.length === 0 && combinedProfiles.length > 0) {
        useStore.getState().toggleActiveProfile(combinedProfiles[0].id)
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
        const startYear = primaryProfile?.startYear || 2022
        
        const yearsToFetch = []
        for (let y = startYear; y <= selectedYear + 1; y++) {
          yearsToFetch.push(y)
        }
        
        const allData = await Promise.all(yearsToFetch.map(y => getCalendarData(y, stateCode)))
        const mergedHolidays: Record<string, string> = {}
        const mergedVacations: any[] = []
        
        allData.forEach(d => {
          Object.assign(mergedHolidays, d.holidays)
          mergedVacations.push(...d.vacations)
        })
        
        useStore.getState().setHolidays(mergedHolidays)
        useStore.getState().setVacations(mergedVacations)
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
