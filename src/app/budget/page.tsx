import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ensureDefaultProfile } from "@/lib/ensureDefaultProfile"
import StoreHydrator from "@/components/StoreHydrator"
import BudgetList from "@/components/Budget/BudgetList"
import { CalendarEntry, EntryType, Trip, TripBudget } from "@/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Budget & Reisekosten - Urlaubsplaner",
  description: "Verwalte Reisebudgets, erfasse gemeinsame Ausgaben und begleiche Salden transparent.",
}

export default async function BudgetPage() {
  const profilesRaw = await ensureDefaultProfile()

  const entriesRaw = await prisma.entry.findMany()
  const overrides = await prisma.profileYearOverride.findMany()
  const tripsRaw = await prisma.trip.findMany({
    include: { profiles: true },
    orderBy: { startDate: "asc" },
  })

  const budgetsRaw = await prisma.tripBudget.findMany({
    include: {
      trip: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          country: true,
          location: true,
          status: true,
          duration: true,
          profiles: { select: { id: true } },
          type: true,
        },
      },
      participants: {
        include: {
          profile: true,
        },
      },
      categories: true,
      expenses: {
        include: {
          splits: true,
          category: true,
          payer: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Format Types
  const entries: CalendarEntry[] = entriesRaw.map((e: any) => ({
    id: e.id,
    date: e.date,
    type: e.type as EntryType,
    profileId: e.profileId,
  }))

  const trips: Trip[] = tripsRaw.map((t: any) => ({
    ...t,
    profiles: t.profiles.map((p: any) => ({ id: p.id })),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  const currentYear = new Date().getFullYear()

  return (
    <div className="flex-1 w-full h-full bg-transparent overflow-y-auto overflow-x-hidden custom-scrollbar">
      <StoreHydrator
        profiles={profilesRaw}
        entries={entries}
        overrides={overrides}
        trips={trips}
      />
      <BudgetList
        budgets={budgetsRaw as unknown as TripBudget[]}
        trips={trips}
        profiles={profilesRaw}
        initialYear={currentYear}
      />
    </div>
  )
}
