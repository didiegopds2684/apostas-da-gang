import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não definida')
  const url = new URL(connectionString)
  if (!url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', 'verify-full')
  }
  const adapter = new PrismaPg({ connectionString: url.toString() })
  return new PrismaClient({ adapter })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
