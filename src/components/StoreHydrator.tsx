"use client"

"use client"

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { StoreState } from '@/types'

export default function StoreHydrator({ 
  profiles, 
  entries,
  overrides = []
}: { 
  profiles: StoreState['profiles'], 
  entries: StoreState['entries'],
  overrides?: StoreState['overrides']
}) {
  const isHydrated = useRef(false)

  useEffect(() => {
    if (!isHydrated.current) {
      useStore.getState().setProfiles(profiles)
      useStore.getState().setEntries(entries)
      useStore.getState().setOverrides(overrides)
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
  }, [profiles, entries, overrides])

  return null
}
