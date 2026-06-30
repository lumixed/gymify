import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrisma() {
    const adapter = new PrismaLibSql({
        url: 'file:prisma/dev.db',
    })
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
