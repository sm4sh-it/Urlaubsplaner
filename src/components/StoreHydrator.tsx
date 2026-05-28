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
      const currentActive = useStore.getState().activeProfileIds
      if (currentActive.length === 0 && profiles.length > 0) {
        useStore.getState().toggleActiveProfile(profiles[0].id)
      }
      isHydrated.current = true
    }
  }, [profiles, entries, overrides])

  return null
}
