import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedAchievements } from '@/lib/achievements'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Seed on fetch to ensure they exist (safe for sqlite local dev)
    await seedAchievements()

    const unlocked = await prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
    })

    const allBadges = await prisma.achievement.findMany()

    return Response.json({
        unlocked: unlocked.map(u => ({
            id: u.achievement.id,
            name: u.achievement.name,
            description: u.achievement.description,
            icon: u.achievement.icon,
            unlockedAt: u.unlockedAt.toISOString()
        })),
        all: allBadges.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon
        }))
    })
}
