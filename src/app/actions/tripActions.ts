"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTrip(data: any) {
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

  revalidatePath("/")
  return newTrip
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

  revalidatePath("/")
  return updatedTrip
}

export async function deleteTrip(id: string) {
  await prisma.trip.delete({
    where: { id }
  })

  revalidatePath("/")
}
