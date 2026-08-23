import { syncCalendarData } from "../src/app/actions"

async function syncAll() {
  console.log("Synchronisiere Feiertage & Ferien 2026 für NW und BY...")
  await syncCalendarData(2026, "NW")
  await syncCalendarData(2026, "BY")
  console.log("✓ Feiertage & Ferien 2026 synchronisiert!")
}

syncAll().catch(console.error)
