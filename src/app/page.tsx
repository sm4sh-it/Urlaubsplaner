import { prisma } from '@/lib/prisma'
import DashboardHome from '@/components/Dashboard/DashboardHome'
import StoreHydrator from '@/components/StoreHydrator'
import { CalendarEntry, EntryType } from '@/types'


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
  
  // Auto-Archive past trips
  const todayStr = new Date().toISOString().split('T')[0]
  await prisma.trip.updateMany({
    where: {
      endDate: { lt: todayStr },
      status: { not: 'Abgeschlossen' }
    },
    data: {
      status: 'Abgeschlossen'
    }
  })

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
    <div className="flex-1 w-full bg-[var(--bg)]">
      <StoreHydrator profiles={profilesRaw} entries={entries} overrides={overrides} trips={tripsRaw as any} />
      <DashboardHome />
    </div>
  )
}
