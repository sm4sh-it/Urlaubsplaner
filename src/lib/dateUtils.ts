import { getDaysInMonth, isWeekend, format, parseISO } from "date-fns"

export const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
]

export const SHORT_MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
]

export function getMonthDays(year: number, monthIndex: number) {
  const daysInMonth = getDaysInMonth(new Date(year, monthIndex))
  const days = []
  
  for (let d = 1; d <= 31; d++) {
    if (d <= daysInMonth) {
      const date = new Date(year, monthIndex, d)
      days.push({
        day: d,
        date: format(date, 'yyyy-MM-dd'),
        isWeekend: isWeekend(date),
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
