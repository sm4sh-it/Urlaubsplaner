import { Skeleton, TripCardSkeleton } from "@/components/ui/Skeleton"

export default function RootLoading() {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6 md:gap-8 animate-pulse">
        
        {/* Stats Row Placeholder */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Contribution Graph Skeleton */}
        <div className="w-full bg-white dark:bg-[#0d141d]/75 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>

        {/* Trips Grid Skeleton */}
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>

          <div className="vacation-grid">
            <TripCardSkeleton />
            <TripCardSkeleton />
            <TripCardSkeleton />
          </div>
        </div>

      </main>
    </div>
  )
}
