import HistoricalDistributionGraph from "@/components/Statistics/HistoricalDistributionGraph"
import { 
  TripCategoryWidget, 
  TravelTypeWidget,
  TransportWidget, 
  StatusWidget, 
  AvgDurationWidget, 
  BudgetWidget, 
  BridgeDaysWidget,
  WorkRatioWidget,
  VacationHabitsWidget,
  CountryWidget,
  HolidayEfficiencyWidget,
  PeakTravelMonthWidget
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
  const entries: CalendarEntry[] = entriesRaw.map((e: any) => ({
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
      
      {/* Unified 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full mt-2">
        {/* Row 2: 1/4, 1/4, 2/4 */}
        <VacationHabitsWidget />
        <WorkRatioWidget />
        <div className="md:col-span-2 xl:col-span-2">
          <HolidayEfficiencyWidget />
        </div>

        {/* Row 3: 1/4, 1/4, 1/4 + 1/4 (Graph) */}
        <AvgDurationWidget />
        <BudgetWidget />
        <BridgeDaysWidget />
        
        {/* Historical Distribution Graph (spans 3 rows in 4th column on xl) */}
        <div className="xl:col-span-1 xl:row-span-3 w-full flex flex-col min-w-0">
          <HistoricalDistributionGraph />
        </div>

        {/* Row 4: 1/4, 1/4, 1/4 */}
        <StatusWidget />
        <TripCategoryWidget />
        <TravelTypeWidget />

        {/* Row 5: 1/4, 1/4, 1/4 */}
        <TransportWidget />
        <CountryWidget />
        <PeakTravelMonthWidget />
      </div>
      </div>
    </div>
  )
}
