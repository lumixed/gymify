import { prisma } from '@/lib/db'

export const BADGE_DEFINITIONS = [
    {
        name: 'First Blood',
        description: 'Complete your first workout session.',
        icon: '🩸',
        condition: 'FIRST_WORKOUT',
    },
    {
        name: 'Century Club',
        description: 'Perform 100 total reps across all sessions.',
        icon: '💯',
        condition: '100_REPS',
    },
    {
        name: 'Perfect Form',
        description: 'Complete a session with an average score of 95 or higher.',
        icon: '🎯',
        condition: 'PERFECT_FORM',
    },
    {
        name: 'Iron Will',
        description: 'Workout for a total of 1 hour.',
        icon: '🦾',
        condition: '1_HOUR_TOTAL',
    },
]

// Call this on app startup or first use to ensure badges are in the DB
export async function seedAchievements() {
    for (const badge of BADGE_DEFINITIONS) {
        await prisma.achievement.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        })
    }
}

// Evaluate user's stats and award new badges
export async function evaluateAchievements(userId: string) {
    // 1. Get all unlocked achievements for this user
    const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
    })
    const unlockedConditions = new Set(userAchievements.map((ua) => ua.achievement.condition))

    // 2. Fetch user's workout data
    const sessions = await prisma.workoutSession.findMany({
        where: { userId },
    })

    const newUnlocks: string[] = [] // Store achievement IDs to unlock

    // We only fetch definitions from DB to get their IDs
    const allAchievements = await prisma.achievement.findMany()

    for (const ach of allAchievements) {
        if (unlockedConditions.has(ach.condition)) continue // Already unlocked

        let conditionMet = false

        switch (ach.condition) {
            case 'FIRST_WORKOUT':
                conditionMet = sessions.length > 0
                break
            case '100_REPS':
                const totalReps = sessions.reduce((sum, s) => sum + s.reps, 0)
                conditionMet = totalReps >= 100
                break
            case 'PERFECT_FORM':
                conditionMet = sessions.some((s) => s.avgScore >= 95)
                break
            case '1_HOUR_TOTAL':
                const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)
                conditionMet = totalSeconds >= 3600
                break
        }

        if (conditionMet) {
            newUnlocks.push(ach.id)
        }
    }

    // 3. Award new badges
    for (const achievementId of newUnlocks) {
        await prisma.userAchievement.create({
            data: {
                userId,
                achievementId,
            },
        })
    }
    
    return newUnlocks.length > 0
}
