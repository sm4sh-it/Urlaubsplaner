import { Skeleton, TripCardSkeleton } from "@/components/ui/Skeleton"

export default function BudgetLoading() {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
        </div>

      </main>
    </div>
  )
}
