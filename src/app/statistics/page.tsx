import HistoricalDistributionGraph from "@/components/Statistics/HistoricalDistributionGraph"
import { 
  TripCategoryWidget, 
  TravelTypeWidget,
  TransportWidget, 
  StatusWidget, 
  AvgDurationWidget, 
  BudgetWidget, 
  BridgeDaysWidget 
} from "@/components/Statistics/Widgets"

import ScatterPlotWidget from "@/components/Statistics/ScatterPlotWidget"
import SickDaysRadarWidget from "@/components/Statistics/SickDaysRadarWidget"
import VacationBurnDownWidget from "@/components/Statistics/VacationBurnDownWidget"
import StoreHydrator from "@/components/StoreHydrator"
import { prisma } from "@/lib/prisma"
import { CalendarEntry, EntryType } from "@/types"
import { ensureDefaultProfile } from "@/lib/ensureDefaultProfile"

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  let profilesRaw = await ensureDefaultProfile()

  const entriesRaw = await prisma.entry.findMany()
  const overrides = await prisma.profileYearOverride.findMany()
  const tripsRaw = await prisma.trip.findMany({
    include: { profiles: true }
  })

  // Ensure entries cast to CalendarEntry to match types
  const entries: CalendarEntry[] = entriesRaw.map(e => ({
    id: e.id,
    date: e.date,
    type: e.type as EntryType,
    profileId: e.profileId
  }))

  return (
    <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="flex flex-col p-4 md:p-8 w-full max-w-[1600px] mx-auto">
        <StoreHydrator profiles={profilesRaw} entries={entries} overrides={overrides} trips={tripsRaw as any} />
      
      {/* Jahresabhängige Statistiken */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full mb-4">
        <VacationBurnDownWidget />
        <SickDaysRadarWidget />
        <ScatterPlotWidget />
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-2" />
      
      <div className="flex flex-col xl:flex-row items-start gap-4 md:gap-6 w-full mt-2">
        {/* Left Column: Stacked Widgets */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <AvgDurationWidget />
          <BridgeDaysWidget />
          <BudgetWidget />
          <StatusWidget />
          <TripCategoryWidget />
          <TravelTypeWidget />
          <TransportWidget />
        </div>

        {/* Right Column: Main Graph */}
        <div className="w-full xl:w-fit flex-shrink-0 flex flex-col gap-4 md:gap-6 min-w-0">
          <HistoricalDistributionGraph />
        </div>
      </div>
      </div>
    </div>
  )
}
