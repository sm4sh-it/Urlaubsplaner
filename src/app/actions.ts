"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { EntryType, Profile } from '@/types'
import { z } from 'zod'
import { cookies } from 'next/headers'

// --- Validation Schemas ---
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
const typeSchema = z.string().nullable()
const idSchema = z.string().uuid("Invalid ID format")

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex"),
  annualLeave: z.number().min(0),
  remainingLeave: z.number().min(0),
  additionalLeave: z.number().min(0),
  remainingLeaveExpiryDate: z.string().regex(/^\d{2}-\d{2}$/, "Invalid MM-DD format"),
  stateCode: z.string().length(2),
  startYear: z.number().int().min(2022).max(2100)
})

const yearSchema = z.number().int().min(2022).max(2100)
const stateCodeSchema = z.string().min(2).max(3)

const feiertageApiResponseSchema = z.record(z.string(), z.object({
  datum: z.string()
}).passthrough())

const vacationItemSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  name: z.array(z.object({
    language: z.string(),
    text: z.string()
  }).passthrough()).optional()
}).passthrough()

const openHolidaysApiResponseSchema = z.union([
  z.array(vacationItemSchema),
  z.object({ value: z.array(vacationItemSchema) }).passthrough()
])

// --- Auth Action ---
export async function authenticate(password: string) {
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  const correctPassword = process.env.APP_PASSWORD
  
  // Wenn AUTH_ENABLED explizit auf 'false' gesetzt ist, lassen wir jeden rein.
  if (!authEnabled) {
    (await cookies()).set('sm4sh_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return { success: true }
  }

  // Ab hier ist Authentifizierung Pflicht!
  if (!correctPassword) {
    return { success: false, error: "Server-Konfigurationsfehler: Kein Passwort in .env gesetzt." }
  }
  
  if (password === correctPassword) {
    (await cookies()).set('sm4sh_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return { success: true }
  }
  
  return { success: false, error: "Falsches Passwort" }
}

export async function logout() {
  (await cookies()).delete('sm4sh_auth')
  return { success: true }
}

// --- App Actions ---
export async function toggleEntry(date: string, type: EntryType | null, profileId: string) {
  // Validate
  const parsedDate = dateSchema.parse(date)
  const parsedType = typeSchema.parse(type) as EntryType | null
  const parsedProfileId = idSchema.parse(profileId)

  // If type is null, we delete the entry
  if (!parsedType) {
    await prisma.entry.deleteMany({
      where: {
        date: parsedDate,
        profileId: parsedProfileId
      }
    })
    revalidatePath('/', 'layout')
    return { success: true, action: 'deleted' }
  }

  // Otherwise upsert
  const entry = await prisma.entry.upsert({
    where: {
      date_profileId: {
        date: parsedDate,
        profileId: parsedProfileId
      }
    },
    update: { type: parsedType },
    create: { date: parsedDate, type: parsedType, profileId: parsedProfileId }
  })

  revalidatePath('/', 'layout')
  return { success: true, action: 'upserted', entry }
}

export async function createProfile(data: Omit<Profile, 'id'>) {
  const parsedData = profileSchema.parse(data)
  const profile = await prisma.profile.create({
    data: parsedData
  })
  revalidatePath('/', 'layout')
  return { success: true, profile }
}

export async function updateProfile(id: string, data: Omit<Profile, 'id'>) {
  const parsedId = idSchema.parse(id)
  const parsedData = profileSchema.parse(data)
  const profile = await prisma.profile.update({
    where: { id: parsedId },
    data: parsedData
  })
  revalidatePath('/', 'layout')
  return { success: true, profile }
}

export async function deleteProfile(id: string) {
  const parsedId = idSchema.parse(id)
  await prisma.profile.delete({
    where: { id: parsedId }
  })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function syncCalendarData(year: number, stateCode: string) {
  try {
    const parsedYear = yearSchema.parse(year)
    const parsedState = stateCodeSchema.parse(stateCode)

    const currentYear = new Date().getFullYear()
    if (parsedYear < 2022 || parsedYear > currentYear + 4) {
      return { success: true } // Don't fetch data, just pretend we did
    }

    // 1. Fetch from APIs (immer frisch)
    const [holidaysRes, vacationsRes] = await Promise.all([
      fetch(`https://feiertage-api.de/api/?jahr=${parsedYear}&nur_land=${parsedState}`, { cache: 'no-store' }),
      fetch(`https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=${parsedYear}-01-01&validTo=${parsedYear}-12-31&subdivisionCode=DE-${parsedState}`, { cache: 'no-store' })
    ])

    if (!holidaysRes.ok || !vacationsRes.ok) {
      throw new Error("Failed to fetch from external APIs")
    }

    const rawHolidaysData = await holidaysRes.json()
    const rawVacationsData = await vacationsRes.json()

    // Validate external responses
    const holidaysData = feiertageApiResponseSchema.parse(rawHolidaysData)
    const parsedVacationsData = openHolidaysApiResponseSchema.parse(rawVacationsData)

    // 2. Clear old cache for this year and state
    await prisma.holidayCache.deleteMany({
      where: { year: parsedYear, stateCode: parsedState }
    })
    await prisma.vacationCache.deleteMany({
      where: { year: parsedYear, stateCode: parsedState }
    })

    // 3. Save Holidays
    const holidayInserts = Object.entries(holidaysData).map(([name, h]) => ({
      date: h.datum,
      name,
      stateCode: parsedState,
      year: parsedYear
    }))
    if (holidayInserts.length > 0) {
      await prisma.holidayCache.createMany({ data: holidayInserts })
    }

    // 4. Save Vacations
    const vacationArray = Array.isArray(parsedVacationsData) ? parsedVacationsData : parsedVacationsData.value
    const vacationInserts = vacationArray.map(v => ({
      startDate: v.startDate,
      endDate: v.endDate,
      name: v.name?.find(n => n.language === 'DE')?.text || 'Ferien',
      stateCode: parsedState,
      year: parsedYear
    }))
    if (vacationInserts.length > 0) {
      await prisma.vacationCache.createMany({ data: vacationInserts })
    }

    return { success: true }
  } catch (e) {
    console.error("Sync error:", e)
    return { success: false, error: "Sync failed" }
  }
}

export async function getCalendarData(year: number, stateCode: string) {
  const parsedYear = yearSchema.parse(year)
  const parsedState = stateCodeSchema.parse(stateCode)

  if (parsedState === 'ALL') {
    const allStates = ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"]
    const allData = await Promise.all(
      allStates.map(async (s) => {
        try {
          return await getCalendarData(year, s)
        } catch (e) {
          console.error("Failed fetching for " + s, e)
          return { holidays: {}, vacations: [] }
        }
      })
    )

    const mergedHolidays: Record<string, string> = {}
    const mergedVacations: { start: string, end: string, name: string, stateCode: string }[] = []

    for (const data of allData) {
      for (const [date, name] of Object.entries(data.holidays)) {
        if (!mergedHolidays[date]) mergedHolidays[date] = name
      }
      mergedVacations.push(...data.vacations)
    }

    return {
      holidays: mergedHolidays,
      vacations: mergedVacations
    }
  }

  // Check if we have data
  const holidayCount = await prisma.holidayCache.count({ where: { year: parsedYear, stateCode: parsedState } })
  
  if (holidayCount === 0) {
    // Auto-sync if missing
    await syncCalendarData(parsedYear, parsedState)
  }

  const holidays = await prisma.holidayCache.findMany({ where: { year: parsedYear, stateCode: parsedState } })
  const vacations = await prisma.vacationCache.findMany({ where: { year: parsedYear, stateCode: parsedState } })

  // Transform to Frontend format
  const holidayMap: Record<string, string> = {}
  holidays.forEach(h => { holidayMap[h.date] = h.name })

  const vacationList = vacations.map(v => ({
    start: v.startDate,
    end: v.endDate,
    name: v.name,
    stateCode: v.stateCode
  }))

  return {
    holidays: holidayMap,
    vacations: vacationList
  }
}

export async function archivePassedTrips() {
  const todayStr = new Date().toISOString().split('T')[0]
  await prisma.trip.updateMany({
    where: {
      endDate: { lt: todayStr },
      status: { not: 'Abgeschlossen' }
    },
    data: {
      status: 'Abgeschlossen'
    }
  })
}


