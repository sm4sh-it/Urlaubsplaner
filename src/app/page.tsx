import { prisma } from '@/lib/prisma'
import DashboardHome from '@/components/Dashboard/DashboardHome'
import StoreHydrator from '@/components/StoreHydrator'
import { ensureDefaultProfile } from '@/lib/ensureDefaultProfile'
import { archivePassedTrips } from '@/app/actions'
import { CalendarEntry, EntryType } from '@/types'


export const dynamic = 'force-dynamic'

export default async function Home() {
  let profilesRaw = await ensureDefaultProfile()

  const entriesRaw = await prisma.entry.findMany()
  const overrides = await prisma.profileYearOverride.findMany()
  
  // Auto-Archive past trips
  await archivePassedTrips()

  const tripsRaw = await prisma.trip.findMany({
    include: { profiles: true },
    orderBy: { startDate: 'asc' }
  })

  // Ensure entries cast to CalendarEntry to match types
  const entries: CalendarEntry[] = entriesRaw.map(e => ({
    id: e.id,
    date: e.date,
    type: e.type as EntryType,
    profileId: e.profileId
  }))

  return (
    <div className="flex-1 w-full h-full bg-transparent overflow-y-auto overflow-x-hidden custom-scrollbar">
      <StoreHydrator profiles={profilesRaw} entries={entries} overrides={overrides} trips={tripsRaw as any} />
      <DashboardHome />
    </div>
  )
}
