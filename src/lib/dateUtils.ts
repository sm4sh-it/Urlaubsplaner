import { getDaysInMonth, isWeekend as isWeekendFns, format, parseISO } from "date-fns"

export const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
]

export const SHORT_MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
]

export function getMonthDays(year: number, monthIndex: number, workingDaysArr?: number[]) {
  const daysInMonth = getDaysInMonth(new Date(year, monthIndex))
  const days = []
  
  for (let d = 1; d <= 31; d++) {
    if (d <= daysInMonth) {
      const date = new Date(year, monthIndex, d)
      
      let isWknd = false
      if (workingDaysArr) {
        let dow = date.getDay()
        if (dow === 0) dow = 7
        isWknd = !workingDaysArr.includes(dow)
      } else {
        isWknd = isWeekendFns(date)
      }

      days.push({
        day: d,
        date: format(date, 'yyyy-MM-dd'),
        isWeekend: isWknd,
        isValid: true
      })
    } else {
      days.push({
        day: d,
        date: "",
        isWeekend: false,
        isValid: false
      })
    }
  }
  
  return days
}
