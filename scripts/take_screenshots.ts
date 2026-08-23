import puppeteer from "puppeteer-core"
import fs from "fs"
import path from "path"
import { prisma } from "../src/lib/prisma"

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH

const OUTPUT_DIR = path.resolve(process.cwd(), "Workfiles", "screenshots")

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface CaptureItem {
  name: string
  title: string
  url: string
  waitSelector?: string
  tabText?: string
  clickSelectorText?: string
}

async function main() {
  await ensureDir(OUTPUT_DIR)
  console.log(`📸 Screenshots werden gespeichert in: ${OUTPUT_DIR}`)

  // Find demo budget ID
  const romBudget = await prisma.tripBudget.findFirst({
    where: { name: "Städtetrip Rom" },
  })
  const budgetId = romBudget ? romBudget.id : ""
  console.log(`Gefundenes Budget ID für Rom: ${budgetId}`)

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  console.log("1. Authentifizierung durchführen...")
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" })
  
  // Fill password
  const passwordInput = await page.$("input[type='password']")
  if (passwordInput) {
    await passwordInput.type("sm4sh")
    const submitBtn = await page.$("button[type='submit']")
    if (submitBtn) {
      await submitBtn.click()
      await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {})
    }
  }

  await sleep(1500)

  // Helper to toggle theme
  async function setTheme(theme: "light" | "dark") {
    await page.evaluate((t) => {
      if (t === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      localStorage.setItem("theme", t)
    }, theme)
    await sleep(400)
  }

  const captureList: CaptureItem[] = [
    {
      name: "01_dashboard",
      title: "Dashboard & Übersicht",
      url: "http://localhost:3000/",
      waitSelector: "h1",
    },
    {
      name: "02_calendar",
      title: "Jahreskalender Übersicht",
      url: "http://localhost:3000/calendar",
      waitSelector: "h1",
    },
    {
      name: "02b_calendar_legend",
      title: "Jahreskalender mit ausgeklappter Legende",
      url: "http://localhost:3000/calendar",
      clickSelectorText: "Legende",
    },
    {
      name: "03_budget_overview",
      title: "Budget- & Reisekosten Hauptübersicht",
      url: "http://localhost:3000/budget",
      waitSelector: "h1",
    },
    {
      name: "04_budget_detail_expenses",
      title: "Budget Detail - Ausgabenliste",
      url: `http://localhost:3000/budget/${budgetId}`,
      waitSelector: "h1",
    },
    {
      name: "05_budget_detail_analytics",
      title: "Budget Detail - Kategorien & Analytics",
      url: `http://localhost:3000/budget/${budgetId}`,
      tabText: "Kategorien & Analytics",
    },
    {
      name: "06_budget_detail_settlement",
      title: "Budget Detail - Abrechnung & Salden",
      url: `http://localhost:3000/budget/${budgetId}`,
      tabText: "Abrechnung & Salden",
    },
    {
      name: "07_budget_detail_participants",
      title: "Budget Detail - Teilnehmer",
      url: `http://localhost:3000/budget/${budgetId}`,
      tabText: "Teilnehmer",
    },
    {
      name: "08_statistics",
      title: "Statistiken & Urlaubsanalyse",
      url: "http://localhost:3000/statistics",
      waitSelector: "h1",
    },
    {
      name: "08b_archive",
      title: "Reise-Archiv Übersicht",
      url: "http://localhost:3000/archive",
      waitSelector: "h1",
    },
    {
      name: "09_settings_profiles",
      title: "Einstellungen & Profile",
      url: "http://localhost:3000/settings",
      waitSelector: "h1",
    },
    {
      name: "10_about",
      title: "Über das Projekt & Changelog",
      url: "http://localhost:3000/about",
      waitSelector: "h1",
    },
  ]

  // Capture Light Mode
  console.log("\n📷 Erstelle Light-Mode Screenshots in FullHD (1920x1080)...")
  for (const item of captureList) {
    try {
      console.log(`  -> Erfasse ${item.title} (${item.name}.png)...`)
      await page.goto(item.url, { waitUntil: "networkidle0" })
      await setTheme("light")
      await sleep(1000)

      if (item.tabText) {
        // Click tab by text
        await page.evaluate((text) => {
          const buttons = Array.from(document.querySelectorAll("button"))
          const target = buttons.find((b) => b.textContent && b.textContent.includes(text))
          if (target) (target as HTMLElement).click()
        }, item.tabText)
        await sleep(800)
      }

      if (item.clickSelectorText) {
        await page.evaluate((text) => {
          const h2s = Array.from(document.querySelectorAll("h2"))
          const targetH2 = h2s.find((el) => el.textContent && el.textContent.trim() === text)
          if (targetH2) {
            const clickable = (targetH2.closest(".cursor-pointer") || targetH2) as HTMLElement
            clickable.click()
          }
        }, item.clickSelectorText)
        await sleep(1000)
      }

      const filePath = path.join(OUTPUT_DIR, `${item.name}.png`)
      await page.screenshot({ path: filePath, fullPage: false })
      console.log(`     ✓ Gespeichert: ${item.name}.png`)
    } catch (err) {
      console.error(`     ✗ Fehler bei ${item.name}:`, err)
    }
  }

  // Capture Dark Mode
  console.log("\n🌙 Erstelle Dark-Mode Screenshots in FullHD (1920x1080)...")
  for (const item of captureList) {
    try {
      console.log(`  -> Erfasse ${item.title} (Dark Mode: ${item.name}_dark.png)...`)
      await page.goto(item.url, { waitUntil: "networkidle0" })
      await setTheme("dark")
      await sleep(1000)

      if (item.tabText) {
        await page.evaluate((text) => {
          const buttons = Array.from(document.querySelectorAll("button"))
          const target = buttons.find((b) => b.textContent && b.textContent.includes(text))
          if (target) (target as HTMLElement).click()
        }, item.tabText)
        await sleep(800)
      }

      if (item.clickSelectorText) {
        await page.evaluate((text) => {
          const h2s = Array.from(document.querySelectorAll("h2"))
          const targetH2 = h2s.find((el) => el.textContent && el.textContent.trim() === text)
          if (targetH2) {
            const clickable = (targetH2.closest(".cursor-pointer") || targetH2) as HTMLElement
            clickable.click()
          }
        }, item.clickSelectorText)
        await sleep(1000)
      }

      const filePath = path.join(OUTPUT_DIR, `${item.name}_dark.png`)
      await page.screenshot({ path: filePath, fullPage: false })
      console.log(`     ✓ Gespeichert: ${item.name}_dark.png`)
    } catch (err) {
      console.error(`     ✗ Fehler bei ${item.name}_dark:`, err)
    }
  }

  await browser.close()
  await prisma.$disconnect()
  console.log("\n🎉 Alle Screenshots erfolgreich in Workfiles/screenshots abgelegt!")
}

main().catch(console.error)
