import { prisma } from '@/lib/prisma'
import YearCalendar from '@/components/YearCalendar'
import Legend from '@/components/Legend'
import Statistics from '@/components/Statistics'
import StoreHydrator from '@/components/StoreHydrator'
import { CalendarEntry, EntryType } from '@/types'

import DashboardLayout from '@/components/DashboardLayout'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let profilesRaw = await prisma.profile.findMany()
  
  if (profilesRaw.length === 0) {
    const defaultProfile = await prisma.profile.create({
      data: {
        name: "Max Mustermann",
        color: "#10b981",
        annualLeave: 30,
        remainingLeave: 5,
        additionalLeave: 0,
        remainingLeaveExpiryDate: "03-31",
        stateCode: "NW",
        startYear: new Date().getFullYear()
      }
    })
    profilesRaw = [defaultProfile]
  }

  const entriesRaw = await prisma.entry.findMany()
  const overrides = await prisma.profileYearOverride.findMany()

  // Ensure entries cast to CalendarEntry to match types
  const entries: CalendarEntry[] = entriesRaw.map(e => ({
    id: e.id,
    date: e.date,
    type: e.type as EntryType,
    profileId: e.profileId
  }))

  return (
    <>
      <StoreHydrator profiles={profilesRaw} entries={entries} overrides={overrides} />
      <DashboardLayout 
        calendar={<YearCalendar />}
        sidebar={
          <>
            <Statistics />
            <Legend />
          </>
        }
      />
    </>
  )
}
