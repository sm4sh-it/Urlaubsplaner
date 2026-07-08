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

export default function StatisticsPage() {
  return (
    <div className="flex flex-col p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      <div className="flex flex-col xl:flex-row items-start gap-4 md:gap-6 w-full">
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
  )
}
