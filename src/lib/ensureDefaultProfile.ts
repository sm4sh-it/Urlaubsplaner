import { prisma } from "@/lib/prisma"

export async function ensureDefaultProfile() {
  let profiles = await prisma.profile.findMany()
  
  if (profiles.length === 0) {
    const defaultProfile = await prisma.profile.create({
      data: {
        name: "Max Mustermann",
        color: "#10b981",
        annualLeave: 30,
        remainingLeave: 5,
        additionalLeave: 0,
        remainingLeaveExpiryDate: "03-31",
        stateCode: "NW",
        startYear: new Date().getFullYear()
      }
    })
    profiles = [defaultProfile]
  }

  return profiles
}
