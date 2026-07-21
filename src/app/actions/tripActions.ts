"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { invalidateSnapshots } from "@/app/actions"

export async function createTrip(data: any) {
  console.log("createTrip called with data:", JSON.stringify(data, null, 2))
  try {
    const { profileIds, ...tripData } = data

    const newTrip = await prisma.trip.create({
      data: {
        ...tripData,
        profiles: {
          connect: profileIds.map((id: string) => ({ id }))
        }
      },
      include: {
        profiles: true
      }
    })

    // Auto-Cleanup of overlapping entries
    const blockingStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
    if (blockingStatuses.includes(newTrip.status)) {
      await prisma.entry.deleteMany({
        where: {
          profileId: { in: profileIds },
          date: {
            gte: newTrip.startDate,
            lte: newTrip.endDate
          }
        }
      })
    }

    // Invalidate snapshots for all associated profiles
    const tripStartYear = parseInt(newTrip.startDate.split('-')[0], 10)
    for (const pId of profileIds) {
      await invalidateSnapshots(pId, tripStartYear - 1)
    }

    revalidatePath("/")
    console.log("createTrip successful:", newTrip.id)
    return newTrip
  } catch (error) {
    console.error("createTrip error:", error)
    throw error
  }
}

export async function updateTrip(id: string, data: any) {
  const { profileIds, ...tripData } = data

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: {
      ...tripData,
      profiles: {
        set: profileIds.map((id: string) => ({ id }))
      }
    },
    include: {
      profiles: true
    }
  })

  // Auto-Cleanup of overlapping entries
  const blockingStatuses = ["In Planung", "Gebucht", "Abgeschlossen"]
  if (blockingStatuses.includes(updatedTrip.status)) {
    await prisma.entry.deleteMany({
      where: {
        profileId: { in: profileIds },
        date: {
          gte: updatedTrip.startDate,
          lte: updatedTrip.endDate
        }
      }
    })
  }

  // Invalidate snapshots for all associated profiles
  const tripStartYear = parseInt(updatedTrip.startDate.split('-')[0], 10)
  for (const pId of profileIds) {
    await invalidateSnapshots(pId, tripStartYear - 1)
  }

  revalidatePath("/")
  return updatedTrip
}

export async function deleteTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { profiles: true }
  })
  
  if (trip) {
    const tripStartYear = parseInt(trip.startDate.split('-')[0], 10)
    const profileIds = trip.profiles.map(p => p.id)
    
    await prisma.trip.delete({
      where: { id }
    })

    for (const pId of profileIds) {
      await invalidateSnapshots(pId, tripStartYear - 1)
    }
  }

  revalidatePath("/")
}
