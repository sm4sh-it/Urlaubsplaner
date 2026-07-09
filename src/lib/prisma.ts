import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getPrisma = () => {
  const isProd = process.env.NODE_ENV === 'production'
  const url = process.env.DATABASE_URL
  
  if (isProd && !url) {
    throw new Error("DATABASE_URL is not set but required in production")
  }

  const dbUrl = url || 'file:./dev.db'
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || getPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
