import { WidgetSkeleton } from "@/components/ui/Skeleton"

export default function StatisticsLoading() {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <main className="max-w-[1600px] w-full mx-auto p-3 sm:p-5 md:p-8 pt-2 sm:pt-4 md:pt-6 pb-24 md:pb-28 flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      </main>
    </div>
  )
}
