import { prisma } from "../src/lib/prisma"

async function main() {
  console.log("🌱 Starte Seeding von realistischen Beispieldaten...")

  // 1. Clean existing demo data
  await prisma.expenseSplit.deleteMany()
  await prisma.budgetExpense.deleteMany()
  await prisma.budgetCategory.deleteMany()
  await prisma.budgetParticipant.deleteMany()
  await prisma.tripBudget.deleteMany()
  await prisma.entry.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.profileYearOverride.deleteMany()
  await prisma.profile.deleteMany()

  // 2. Create Profiles
  const profileMax = await prisma.profile.create({
    data: {
      name: "Max Mustermann",
      color: "#10b981", // Emerald
      annualLeave: 30,
      remainingLeave: 2.5,
      additionalLeave: 0,
      remainingLeaveExpiryDate: "03-31",
      stateCode: "NW",
      startYear: 2026,
      workingDays: "1,2,3,4,5",
    },
  })

  const profileSarah = await prisma.profile.create({
    data: {
      name: "Sarah Schmidt",
      color: "#0ea5e9", // Sky
      annualLeave: 28,
      remainingLeave: 0,
      additionalLeave: 1,
      remainingLeaveExpiryDate: "03-31",
      stateCode: "NW",
      startYear: 2026,
      workingDays: "1,2,3,4,5",
    },
  })

  const profileJonas = await prisma.profile.create({
    data: {
      name: "Jonas Weber",
      color: "#8b5cf6", // Purple
      annualLeave: 30,
      remainingLeave: 4.0,
      additionalLeave: 0,
      remainingLeaveExpiryDate: "03-31",
      stateCode: "BY",
      startYear: 2026,
      workingDays: "1,2,3,4,5",
    },
  })

  console.log("✓ 3 Profile erstellt (Max, Sarah, Jonas)")

  // 3. Create Trips
  const tripMallorca = await prisma.trip.create({
    data: {
      title: "Sommerurlaub Mallorca",
      startDate: "2026-07-11",
      endDate: "2026-07-25",
      duration: 15,
      type: "Urlaub",
      status: "Bestätigt",
      location: "Palma de Mallorca, Spanien",
      country: "Spanien",
      travelType: "Strandurlaub",
      transport: "Flug",
      budget: 2800,
      cost: 2450,
      notes: "Finca im Landesinneren mit Pool gemietet. Mietwagen ab Flughafen Palma.",
      profiles: {
        connect: [{ id: profileMax.id }, { id: profileSarah.id }],
      },
    },
  })

  const tripRom = await prisma.trip.create({
    data: {
      title: "Städtetrip Rom",
      startDate: "2026-04-18",
      endDate: "2026-04-22",
      duration: 5,
      type: "Urlaub",
      status: "Abgeschlossen",
      location: "Rom, Italien",
      country: "Italien",
      travelType: "Städtetrip",
      transport: "Flug",
      budget: 1500,
      cost: 1451,
      notes: "Kolosseum-Tour, Vatikanische Museen und Trastevere Restaurantbesuche.",
      profiles: {
        connect: [{ id: profileMax.id }, { id: profileSarah.id }, { id: profileJonas.id }],
      },
    },
  })

  const tripSki = await prisma.trip.create({
    data: {
      title: "Skiurlaub Zillertal",
      startDate: "2026-12-19",
      endDate: "2026-12-26",
      duration: 8,
      type: "Urlaub",
      status: "Geplant",
      location: "Mayrhofen, Österreich",
      country: "Österreich",
      travelType: "Skiurlaub",
      transport: "Auto",
      budget: 2200,
      notes: "Chalet direkt an der Piste reserviert.",
      profiles: {
        connect: [{ id: profileMax.id }, { id: profileJonas.id }],
      },
    },
  })

  console.log("✓ 3 Reisen angelegt (Mallorca, Rom, Skiurlaub)")

  // 4. Create Calendar Entries (2026)
  const entriesData: { date: string; type: string; profileId: string }[] = []

  // Max Entries
  // Rom: April 20, 21, 22 (18 & 19 are weekend)
  entriesData.push(
    { date: "2026-04-20", type: "U", profileId: profileMax.id },
    { date: "2026-04-21", type: "U", profileId: profileMax.id },
    { date: "2026-04-22", type: "U", profileId: profileMax.id }
  )

  // Brückentag nach Christi Himmelfahrt: Fr 15.05.2026
  entriesData.push({ date: "2026-05-15", type: "U", profileId: profileMax.id })

  // Mallorca Urlaub: 13.07.2026 - 24.07.2026 (Workdays)
  const mallorcaDaysMax = [
    "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17",
    "2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24",
  ]
  mallorcaDaysMax.forEach((d) => entriesData.push({ date: d, type: "U", profileId: profileMax.id }))

  // Bildungsurlaub: 14.09.2026 - 18.09.2026
  const buDays = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18"]
  buDays.forEach((d) => entriesData.push({ date: d, type: "B", profileId: profileMax.id }))

  // Skiurlaub: 21.12.2026 - 23.12.2026
  entriesData.push(
    { date: "2026-12-21", type: "U", profileId: profileMax.id },
    { date: "2026-12-22", type: "U", profileId: profileMax.id },
    { date: "2026-12-23", type: "U", profileId: profileMax.id }
  )

  // Überstundenausgleich & Sick & Mobile Work for Max
  entriesData.push(
    { date: "2026-03-20", type: "Ü", profileId: profileMax.id },
    { date: "2026-02-09", type: "K", profileId: profileMax.id },
    { date: "2026-02-10", type: "K", profileId: profileMax.id },
    { date: "2026-06-12", type: "M", profileId: profileMax.id },
    { date: "2026-06-19", type: "M", profileId: profileMax.id },
    { date: "2026-08-07", type: "5", profileId: profileMax.id }, // M/2 (Halbtag Mobiles Arbeiten)
    { date: "2026-10-02", type: "2", profileId: profileMax.id }  // U/2 (Halbtag Urlaub)
  )

  // Sarah Entries
  // Rom
  entriesData.push(
    { date: "2026-04-20", type: "U", profileId: profileSarah.id },
    { date: "2026-04-21", type: "U", profileId: profileSarah.id },
    { date: "2026-04-22", type: "U", profileId: profileSarah.id }
  )
  // Mallorca
  mallorcaDaysMax.forEach((d) => entriesData.push({ date: d, type: "U", profileId: profileSarah.id }))
  // Dienstreise
  entriesData.push(
    { date: "2026-10-12", type: "D", profileId: profileSarah.id },
    { date: "2026-10-13", type: "D", profileId: profileSarah.id },
    { date: "2026-10-14", type: "D", profileId: profileSarah.id }
  )
  // Mobile Work
  entriesData.push(
    { date: "2026-05-08", type: "M", profileId: profileSarah.id },
    { date: "2026-05-22", type: "M", profileId: profileSarah.id },
    { date: "2026-06-05", type: "U", profileId: profileSarah.id }
  )

  // Jonas Entries
  // Rom
  entriesData.push(
    { date: "2026-04-20", type: "U", profileId: profileJonas.id },
    { date: "2026-04-21", type: "U", profileId: profileJonas.id },
    { date: "2026-04-22", type: "U", profileId: profileJonas.id }
  )
  // Sommerferien / Urlaub Jonas: 03.08.2026 - 14.08.2026
  const jonasSummer = [
    "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07",
    "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14",
  ]
  jonasSummer.forEach((d) => entriesData.push({ date: d, type: "U", profileId: profileJonas.id }))
  // Skiurlaub
  entriesData.push(
    { date: "2026-12-21", type: "U", profileId: profileJonas.id },
    { date: "2026-12-22", type: "U", profileId: profileJonas.id },
    { date: "2026-12-23", type: "U", profileId: profileJonas.id }
  )

  await prisma.entry.createMany({ data: entriesData })
  console.log(`✓ ${entriesData.length} Kalendereinträge generiert`)

  // 5. Create Detailed Trip Budget (Städtetrip Rom)
  const budgetRom = await prisma.tripBudget.create({
    data: {
      name: "Städtetrip Rom",
      currency: "EUR",
      totalBudget: 1500,
      startDate: "2026-04-18",
      endDate: "2026-04-22",
      tripId: tripRom.id,
    },
  })

  // Categories for Rom
  const catUnterkunft = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Unterkunft", icon: "home", color: "#3b82f6" },
  })
  const catTransport = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Transport", icon: "plane", color: "#0ea5e9" },
  })
  const catEssen = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Verpflegung", icon: "utensils", color: "#10b981" },
  })
  const catAktivitaeten = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Aktivitäten", icon: "compass", color: "#f59e0b" },
  })
  const catShopping = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Shopping", icon: "shopping-bag", color: "#ec4899" },
  })
  const catAusgleich = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Ausgleich", icon: "arrow-right-left", color: "#06b6d4" },
  })
  const catSonstiges = await prisma.budgetCategory.create({
    data: { budgetId: budgetRom.id, name: "Sonstiges", icon: "receipt", color: "#64748b" },
  })

  // Participants for Rom
  const partMax = await prisma.budgetParticipant.create({
    data: { budgetId: budgetRom.id, profileId: profileMax.id, name: "Max", color: profileMax.color },
  })
  const partSarah = await prisma.budgetParticipant.create({
    data: { budgetId: budgetRom.id, profileId: profileSarah.id, name: "Sarah", color: profileSarah.color },
  })
  const partJonas = await prisma.budgetParticipant.create({
    data: { budgetId: budgetRom.id, profileId: profileJonas.id, name: "Jonas", color: profileJonas.color },
  })

  // Helper to add expense with splits
  async function addExpense(
    title: string,
    amount: number,
    date: string,
    catId: string,
    payerId: string,
    participants: typeof partMax[],
    notes?: string
  ) {
    const exp = await prisma.budgetExpense.create({
      data: {
        budgetId: budgetRom.id,
        title,
        amount,
        date,
        categoryId: catId,
        payerId,
        notes: notes || null,
      },
    })

    const share = amount / participants.length
    for (const p of participants) {
      await prisma.expenseSplit.create({
        data: {
          expenseId: exp.id,
          participantId: p.id,
          amount: share,
        },
      })
    }
    return exp
  }

  // Add Real-World Expenses
  await addExpense("Boutique Hotel Trastevere (4 Nächte)", 680, "2026-04-18", catUnterkunft.id, partMax.id, [partMax, partSarah, partJonas], "Zentrales Apartment mit Frühstück")
  await addExpense("Eurowings Flüge Hin & Zurück", 390, "2026-04-18", catTransport.id, partSarah.id, [partMax, partSarah, partJonas], "Inklusive 23kg Aufgabegepäck")
  await addExpense("Abendessen Trattoria da Enzo", 145, "2026-04-19", catEssen.id, partJonas.id, [partMax, partSarah, partJonas], "Pasta & Hauswein")
  await addExpense("Kolosseum & Forum Romanum Führung", 105, "2026-04-20", catAktivitaeten.id, partMax.id, [partMax, partSarah, partJonas], "Skip-the-line Tickets")
  await addExpense("Vatikanische Museen & Sixtinische Kapelle", 84, "2026-04-21", catAktivitaeten.id, partJonas.id, [partMax, partSarah, partJonas])
  await addExpense("Gelato & Espresso Pause", 24, "2026-04-21", catEssen.id, partSarah.id, [partMax, partSarah, partJonas])
  await addExpense("Flughafentransfer Leonardo Express", 42, "2026-04-22", catTransport.id, partMax.id, [partMax, partSarah, partJonas])
  await addExpense("Souvenirs & Spezialitäten", 65, "2026-04-22", catShopping.id, partSarah.id, [partSarah], "Persönlicher Einkauf Sarah")

  // Ausgleichszahlung Jonas an Max (60 €)
  await addExpense("Ausgleich: Jonas an Max", 60, "2026-04-22", catAusgleich.id, partJonas.id, [partMax], "Teilweiser Saldenausgleich via PayPal")

  // 6. Create Second Budget (Mallorca)
  const budgetMallorca = await prisma.tripBudget.create({
    data: {
      name: "Sommerurlaub Mallorca",
      currency: "EUR",
      totalBudget: 2800,
      startDate: "2026-07-11",
      endDate: "2026-07-25",
      tripId: tripMallorca.id,
    },
  })

  const pMallorcaMax = await prisma.budgetParticipant.create({
    data: { budgetId: budgetMallorca.id, profileId: profileMax.id, name: "Max", color: profileMax.color },
  })
  const pMallorcaSarah = await prisma.budgetParticipant.create({
    data: { budgetId: budgetMallorca.id, profileId: profileSarah.id, name: "Sarah", color: profileSarah.color },
  })

  const mCatUnterkunft = await prisma.budgetCategory.create({
    data: { budgetId: budgetMallorca.id, name: "Unterkunft", icon: "home", color: "#3b82f6" },
  })
  const mCatTransport = await prisma.budgetCategory.create({
    data: { budgetId: budgetMallorca.id, name: "Transport", icon: "plane", color: "#0ea5e9" },
  })
  const mCatEssen = await prisma.budgetCategory.create({
    data: { budgetId: budgetMallorca.id, name: "Verpflegung", icon: "utensils", color: "#10b981" },
  })
  const mCatAusgleich = await prisma.budgetCategory.create({
    data: { budgetId: budgetMallorca.id, name: "Ausgleich", icon: "arrow-right-left", color: "#06b6d4" },
  })

  const mExp1 = await prisma.budgetExpense.create({
    data: {
      budgetId: budgetMallorca.id,
      title: "Finca Santanyí (14 Nächte)",
      amount: 1650,
      date: "2026-07-11",
      categoryId: mCatUnterkunft.id,
      payerId: pMallorcaMax.id,
    },
  })
  await prisma.expenseSplit.createMany({
    data: [
      { expenseId: mExp1.id, participantId: pMallorcaMax.id, amount: 825 },
      { expenseId: mExp1.id, participantId: pMallorcaSarah.id, amount: 825 },
    ],
  })

  const mExp2 = await prisma.budgetExpense.create({
    data: {
      budgetId: budgetMallorca.id,
      title: "Direktflüge Palma",
      amount: 480,
      date: "2026-07-11",
      categoryId: mCatTransport.id,
      payerId: pMallorcaSarah.id,
    },
  })
  await prisma.expenseSplit.createMany({
    data: [
      { expenseId: mExp2.id, participantId: pMallorcaMax.id, amount: 240 },
      { expenseId: mExp2.id, participantId: pMallorcaSarah.id, amount: 240 },
    ],
  })

  const mExp3 = await prisma.budgetExpense.create({
    data: {
      budgetId: budgetMallorca.id,
      title: "Mietwagen SUV ab PMI",
      amount: 320,
      date: "2026-07-11",
      categoryId: mCatTransport.id,
      payerId: pMallorcaMax.id,
    },
  })
  await prisma.expenseSplit.createMany({
    data: [
      { expenseId: mExp3.id, participantId: pMallorcaMax.id, amount: 160 },
      { expenseId: mExp3.id, participantId: pMallorcaSarah.id, amount: 160 },
    ],
  })

  console.log("✓ Budgets und Belege für Rom und Mallorca vollständig angelegt!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
