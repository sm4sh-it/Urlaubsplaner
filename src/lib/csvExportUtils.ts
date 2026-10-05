import { BudgetExpense, TripBudget } from "@/types"
import {
  calculateDailyAverage,
  calculateParticipantBalances,
  calculateSmartSettlements,
  calculateTotalExpenses,
  isSettlementExpense,
} from "./budgetUtils"

/**
 * Bereinigt Dateinamen für den sicheren Download im Dateisystem
 */
export function sanitizeCsvFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[/\\?%*:|"<>]/g, "-")
      .replace(/\s+/g, "_") || "Reise-Budget"
  )
}

/**
 * Escaped ein Feld für ein RFC-konformes CSV mit Semikolon als Trennzeichen
 */
function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  // Verdoppelt Anführungszeichen und umgibt den Wert mit Anführungszeichen
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Formatiert Zahlen für das deutsche Excel-Zahlenformat (z. B. 1234,56)
 */
export function formatCsvDecimal(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0,00"
  return val.toFixed(2).replace(".", ",")
}

export interface CsvExportOptions {
  customExpenses?: BudgetExpense[]
  filterLabel?: string
}

/**
 * Erzeugt einen standardkonformen, Excel-optimierten CSV-String (UTF-8 mit BOM, Delimiter ;)
 * Enthält:
 * 1. Vollständige Ausgabentabelle mit Splits & Zahlern
 * 2. Kennzahlen- und Budget-Zusammenfassung
 * 3. Saldenübersicht aller Teilnehmer
 * 4. Optimierte Ausgleichsempfehlungen ("Wer schuldet wem wie viel?")
 */
export function generateTripBudgetCsv(
  budget: TripBudget,
  options?: CsvExportOptions
): string {
  const expensesToExport = options?.customExpenses || budget.expenses
  const currency = budget.currency || "EUR"
  const lines: string[] = []

  // 1. Tabellen-Header der Ausgaben
  const headers = [
    "Datum",
    "Titel",
    "Kategorie",
    "Betrag",
    "Währung",
    "Typ",
    "Bezahlt von",
    "Beteiligte Personen",
    "Aufteilung Details",
    "Notizen",
  ]
  lines.push(headers.map(escapeCsv).join(";"))

  // Teilnehmer-Map für schnelle Namensauflösung
  const participantMap = new Map(budget.participants.map((p) => [p.id, p.name]))
  const categoryMap = new Map(budget.categories.map((c) => [c.id, c.name]))

  // 2. Zeilen der Ausgaben
  for (const exp of expensesToExport) {
    const isSettlement = isSettlementExpense(exp, budget.categories)
    const typeLabel = isSettlement ? "Ausgleichszahlung" : "Ausgabe"

    // Kategorie auflösen
    const categoryName =
      exp.category?.name ||
      (exp.categoryId ? categoryMap.get(exp.categoryId) : null) ||
      (isSettlement ? "Ausgleich" : "Ohne Kategorie")

    // Bezahlt von
    const payerName =
      exp.payer?.name ||
      (exp.payerId ? participantMap.get(exp.payerId) : null) ||
      "Unbekannt"

    // Beteiligte Personen & Split-Details
    const splitNames: string[] = []
    const splitDetails: string[] = []

    if (exp.splits && exp.splits.length > 0) {
      for (const s of exp.splits) {
        const pName =
          s.participant?.name ||
          participantMap.get(s.participantId) ||
          "Unbekannt"
        splitNames.push(pName)
        splitDetails.push(`${pName}: ${formatCsvDecimal(s.amount)} ${currency}`)
      }
    }

    const row = [
      escapeCsv(exp.date || ""),
      escapeCsv(exp.title || ""),
      escapeCsv(categoryName),
      escapeCsv(formatCsvDecimal(exp.amount)),
      escapeCsv(currency),
      escapeCsv(typeLabel),
      escapeCsv(payerName),
      escapeCsv(splitNames.join(", ")),
      escapeCsv(splitDetails.join("; ")),
      escapeCsv(exp.notes || ""),
    ]

    lines.push(row.join(";"))
  }

  // Leerzeile als optischer und funktionaler Trenner für Tabellen-Filter in Excel
  lines.push("")

  // 3. Zusammenfassung & Kennzahlen
  const totalSpent = calculateTotalExpenses(budget.expenses, budget.categories)
  const dailyAvg = calculateDailyAverage(
    budget.expenses,
    budget.startDate,
    budget.endDate,
    budget.categories
  )
  const participantCount = budget.participants.length
  const perPersonAvg = participantCount > 0 ? totalSpent / participantCount : 0

  lines.push(escapeCsv("=== ZUSAMMENFASSUNG & KENNZAHLEN ===") + ";;;;")
  lines.push(
    [
      escapeCsv("Reise-Budget"),
      escapeCsv(budget.name),
      escapeCsv(options?.filterLabel ? `Filter: ${options.filterLabel}` : ""),
    ].join(";")
  )

  if (budget.startDate || budget.endDate) {
    lines.push(
      [
        escapeCsv("Reisezeitraum"),
        escapeCsv(`${budget.startDate || "?"} bis ${budget.endDate || "?"}`),
      ].join(";")
    )
  }

  lines.push(
    [
      escapeCsv("Gesamtausgaben (ohne Ausgleich)"),
      escapeCsv(formatCsvDecimal(totalSpent)),
      escapeCsv(currency),
    ].join(";")
  )

  if (budget.totalBudget && budget.totalBudget > 0) {
    const diff = budget.totalBudget - totalSpent
    lines.push(
      [
        escapeCsv("Geplantes Budget"),
        escapeCsv(formatCsvDecimal(budget.totalBudget)),
        escapeCsv(currency),
      ].join(";")
    )
    lines.push(
      [
        escapeCsv(diff >= 0 ? "Verbleibendes Budget" : "Budget-Überschreitung"),
        escapeCsv(formatCsvDecimal(Math.abs(diff))),
        escapeCsv(currency),
        escapeCsv(diff >= 0 ? "Im Rahmen" : "Überzogen"),
      ].join(";")
    )
  }

  lines.push(
    [
      escapeCsv("Ø Kosten pro Tag"),
      escapeCsv(formatCsvDecimal(dailyAvg.avgPerDay)),
      escapeCsv(currency),
      escapeCsv(`Über ${dailyAvg.daysCount} Reisetag(e)`),
    ].join(";")
  )

  lines.push(
    [
      escapeCsv("Ø Kosten pro Person"),
      escapeCsv(formatCsvDecimal(perPersonAvg)),
      escapeCsv(currency),
      escapeCsv(`Aufgeteilt auf ${participantCount} Teilnehmer`),
    ].join(";")
  )

  lines.push(
    [
      escapeCsv("Exportierte Ausgaben"),
      escapeCsv(expensesToExport.length.toString()),
      escapeCsv(`von insgesamt ${budget.expenses.length} Buchungen`),
    ].join(";")
  )

  // 4. Salden & Kostenanteile
  lines.push("")
  lines.push(escapeCsv("=== SALDEN & KOSTENANTEILE DER TEILNEHMER ===") + ";;;;")
  lines.push(
    [
      escapeCsv("Teilnehmer"),
      escapeCsv("Bezahlt Gesamt"),
      escapeCsv("Eigener Kostenanteil"),
      escapeCsv("Netto-Saldo"),
      escapeCsv("Status"),
    ].join(";")
  )

  const balances = calculateParticipantBalances(budget.participants, budget.expenses)
  for (const b of balances) {
    const isCreditor = b.netBalance > 0.005
    const isDebtor = b.netBalance < -0.005
    const status = isCreditor
      ? "Bekommt Geld zurück"
      : isDebtor
      ? "Muss noch zahlen"
      : "Ausgeglichen"

    const saldoPrefix = b.netBalance > 0 ? "+" : ""
    lines.push(
      [
        escapeCsv(b.participant.name),
        escapeCsv(`${formatCsvDecimal(b.totalPaid)} ${currency}`),
        escapeCsv(`${formatCsvDecimal(b.totalShare)} ${currency}`),
        escapeCsv(`${saldoPrefix}${formatCsvDecimal(b.netBalance)} ${currency}`),
        escapeCsv(status),
      ].join(";")
    )
  }

  // 5. Optimierter Saldenausgleich ("Wer schuldet wem wie viel?")
  lines.push("")
  lines.push(
    escapeCsv("=== SALDENAUSGLEICH (WER SCHULDET WEM WIE VIEL?) ===") + ";;;;"
  )

  const smartSettlements = calculateSmartSettlements(
    budget.participants,
    budget.expenses
  )

  if (smartSettlements.length === 0) {
    lines.push(
      [
        escapeCsv("Alle Salden sind vollständig ausgeglichen."),
        escapeCsv("Keine offenen Ausgleichszahlungen notwendig."),
      ].join(";")
    )
  } else {
    lines.push(
      [
        escapeCsv("Schuldner (zahlt)"),
        escapeCsv("Empfänger (erhält)"),
        escapeCsv("Betrag"),
        escapeCsv("Währung"),
        escapeCsv("Zweck"),
      ].join(";")
    )

    for (const set of smartSettlements) {
      lines.push(
        [
          escapeCsv(set.from.name),
          escapeCsv(set.to.name),
          escapeCsv(formatCsvDecimal(set.amount)),
          escapeCsv(currency),
          escapeCsv(`Ausgleich ${budget.name}`),
        ].join(";")
      )
    }
  }

  // UTF-8 BOM (\uFEFF) voranstellen, damit Microsoft Excel Umlaute & Sonderzeichen direkt nativ erkennt
  return "\uFEFF" + lines.join("\r\n")
}

/**
 * Triggert den Browser-Download der generierten CSV-Datei
 * Gibt den Dateinamen zurück, z.B. für Toast-Benachrichtigungen
 */
export function downloadTripBudgetCsv(
  budget: TripBudget,
  options?: CsvExportOptions
): string {
  const csvContent = generateTripBudgetCsv(budget, options)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `Budget_${sanitizeCsvFilename(budget.name)}_${dateStr}.csv`

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return filename
}
