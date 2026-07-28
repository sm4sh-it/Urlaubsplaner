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
      <div className="flex flex-col p-4 md:p-8 w-full max-w-[1600px] mx-auto gap-4 md:gap-6">
        <StoreHydrator profiles={profilesRaw} entries={entries} overrides={overrides} trips={tripsRaw as any} />
      
        {/* Zeile 1: Urlaubs-Guthaben, Kosten vs. Reisedauer, Feiertags-Effizienz */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <VacationBurnDownWidget />
          <ScatterPlotWidget />
          <HolidayEfficiencyWidget />
        </div>

        {/* Zeile 2: Urlaubsgewohnheiten, Work No Work, Krankheitstage nach Wochentag */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <VacationHabitsWidget />
          <WorkRatioWidget />
          <SickDaysRadarWidget />
        </div>

        {/* Zeile 3: Buchungsstatus, Art der Reise, Reisetyp (Dual Donut Charts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <StatusWidget />
          <TripCategoryWidget />
          <TravelTypeWidget />
        </div>

        {/* Zeile 4 & 5: 4-Spalten Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full">
          {/* Zeile 4 */}
          <AvgDurationWidget />
          <BudgetWidget />
          <BridgeDaysWidget />
          
          {/* Urlaubsverteilung über die Jahre (spans 2 rows in column 4) */}
          <div className="xl:col-span-1 xl:row-span-2 w-full flex flex-col min-w-0">
            <HistoricalDistributionGraph />
          </div>

          {/* Zeile 5 */}
          <TransportWidget />
          <CountryWidget />
          <PeakTravelMonthWidget />
        </div>
      </div>
    </div>
  )
}
