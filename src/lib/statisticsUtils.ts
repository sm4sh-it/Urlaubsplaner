import { Profile, CalendarEntry, Trip } from "@/types"

export interface HolidayEfficiencyBlock {
  startDate: string
  endDate: string
  totalFreeDays: number // Brutto-Freizeit F
  usedVacationDays: number // Netto-Urlaubstage U
  multiplier: number // F / U
  holidaysIncluded: string[]
}

export interface HolidayEfficiencyData {
  bestBlock: HolidayEfficiencyBlock | null
  totalExtraDays: number // sum of (F - U)
  averageMultiplier: number // sum(F) / sum(U)
  blocks: HolidayEfficiencyBlock[]
}

export function calculateHolidayEfficiency(
  year: number,
  profile: Profile,
  entries: CalendarEntry[],
  trips: Trip[],
  holidays: Record<string, string>
): HolidayEfficiencyData {
  const workingDays = profile.workingDays ? profile.workingDays.split(',').map(Number) : [1, 2, 3, 4, 5]
  
  const yearStr = String(year)
  const dayStatus = new Map<string, { isWeekend: boolean, isHoliday: boolean, isFree: boolean, holidayName?: string, vacationCost: number }>()
  
  // Fill 365 days
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year, 11, 31))
  
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    let dow = d.getUTCDay()
    if (dow === 0) dow = 7
    
    const isWeekend = !workingDays.includes(dow)
    const holidayName = holidays[dateStr]
    const isHoliday = !!holidayName
    
    dayStatus.set(dateStr, {
      isWeekend,
      isHoliday,
      isFree: isWeekend || isHoliday,
      holidayName: holidayName,
      vacationCost: 0
    })
  }
  
  // Overlay manual entries
  const profileEntries = entries.filter(e => e.profileId === profile.id && e.date.startsWith(yearStr))
  profileEntries.forEach(entry => {
    const stat = dayStatus.get(entry.date)
    if (!stat) return
    
    let uCost = 0
    let coveredParts = 0 
    const parts = entry.type.split(',')
    
    parts.forEach(part => {
      // Vacation types
      if (part === 'U') { uCost += 1; coveredParts += 2 }
      if (part === '2') { uCost += 0.5; coveredParts += 1 }
      
      // Other free time types
      if (['K', 'Ü', 'S', 'A', 'X', 'B'].includes(part)) coveredParts += 2
      if (['3', '4', '6'].includes(part)) coveredParts += 1
    })
    
    if (!stat.isWeekend && !stat.isHoliday) {
      if (coveredParts >= 2) {
        stat.isFree = true
      } else {
        stat.isFree = false
      }
      stat.vacationCost = uCost
    }
  })
  
  // Overlay trips
  const profileTrips = trips.filter(t => 
    t.profiles.some(p => p.id === profile.id) && 
    ["In Planung", "Gebucht", "Abgeschlossen"].includes(t.status)
  )
  
  profileTrips.forEach(trip => {
    const tStart = new Date(trip.startDate)
    const tEnd = new Date(trip.endDate)
    const isVacation = trip.type === "Urlaub"
    const isOtherFree = ["Sabbatical", "Sonderurlaub", "Überstundenabbau"].includes(trip.type)
    
    for (let d = new Date(tStart); d <= tEnd; d.setUTCDate(d.getUTCDate() + 1)) {
      if (d.getUTCFullYear() !== year) continue;
      
      const month = String(d.getUTCMonth() + 1).padStart(2, '0')
      const day = String(d.getUTCDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const stat = dayStatus.get(dateStr)
      if (!stat) continue
      
      if (!stat.isWeekend && !stat.isHoliday) {
        if (trip.isHalfDay) {
          // Half day trip alone doesn't make the day fully free (if not combined with manual entries, which is rare)
          // For safety, we just mark it as not fully free, unless it was already fully covered by manual entries
          if (!stat.isFree) {
            stat.isFree = false
            if (isVacation) stat.vacationCost += 0.5
          }
        } else {
          if (isVacation) {
            stat.isFree = true
            stat.vacationCost = 1
          } else if (isOtherFree) {
            stat.isFree = true
          } else {
            // Mobiles Arbeiten or Dienstreise = Work
            stat.isFree = false
          }
        }
      }
    }
  })
  
  const blocks: HolidayEfficiencyBlock[] = []
  let currentBlock: HolidayEfficiencyBlock | null = null
  
  const dates = Array.from(dayStatus.keys()).sort()
  
  for (const dateStr of dates) {
    const stat = dayStatus.get(dateStr)!
    
    if (stat.isFree) {
      if (!currentBlock) {
        currentBlock = {
          startDate: dateStr,
          endDate: dateStr,
          totalFreeDays: 0,
          usedVacationDays: 0,
          multiplier: 0,
          holidaysIncluded: []
        }
      }
      currentBlock.endDate = dateStr
      currentBlock.totalFreeDays += 1
      currentBlock.usedVacationDays += stat.vacationCost
      if (stat.isHoliday && stat.holidayName) {
        if (!currentBlock.holidaysIncluded.includes(stat.holidayName)) {
          currentBlock.holidaysIncluded.push(stat.holidayName)
        }
      }
    } else {
      if (currentBlock) {
        if (currentBlock.holidaysIncluded.length > 0 && currentBlock.usedVacationDays > 0) {
          currentBlock.multiplier = currentBlock.totalFreeDays / currentBlock.usedVacationDays
          blocks.push(currentBlock)
        }
        currentBlock = null
      }
    }
  }
  
  if (currentBlock && currentBlock.holidaysIncluded.length > 0 && currentBlock.usedVacationDays > 0) {
    currentBlock.multiplier = currentBlock.totalFreeDays / currentBlock.usedVacationDays
    blocks.push(currentBlock)
  }
  
  blocks.sort((a, b) => b.multiplier - a.multiplier)
  
  let bestBlock: HolidayEfficiencyBlock | null = null
  let totalExtraDays = 0
  let sumF = 0
  let sumU = 0
  
  if (blocks.length > 0) {
    bestBlock = blocks[0]
    for (const b of blocks) {
      totalExtraDays += (b.totalFreeDays - b.usedVacationDays)
      sumF += b.totalFreeDays
      sumU += b.usedVacationDays
    }
  }
  
  const averageMultiplier = sumU > 0 ? sumF / sumU : 0
  
  return {
    bestBlock,
    totalExtraDays,
    averageMultiplier,
    blocks
  }
}
