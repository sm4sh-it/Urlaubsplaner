const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const p = await prisma.profile.findMany();
  const t = await prisma.trip.findMany({include: {profiles: true}});
  const e = await prisma.entry.findMany();
  const o = await prisma.profileYearOverride.findMany();
  
  console.log("PROFILES:", p);
  console.log("ENTRIES (2026):", e.filter(e => e.date.startsWith("2026")));
  console.log("TRIPS:", t);
}

run().catch(console.error).finally(() => prisma.$disconnect());
