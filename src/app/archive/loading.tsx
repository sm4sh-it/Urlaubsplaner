import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton"

export default function ArchiveLoading() {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 md:pt-8 pb-24 md:pb-28 flex flex-col gap-6">
        
        {/* Header & Filter Bar Skeleton */}
        <div className="bg-white dark:bg-[#0d141d]/75 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col gap-4 animate-pulse">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={6} />

      </main>
    </div>
  )
}
