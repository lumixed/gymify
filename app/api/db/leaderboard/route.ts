import { prisma } from '@/lib/db'

export async function GET() {
    // Fetch all users with their sessions and achievements
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            sessionsData: {
                select: { reps: true }
            },
            userAchievements: {
                select: { id: true }
            }
        }
    })

    // Calculate totals for each user
    const leaderboard = users.map(user => {
        const totalReps = user.sessionsData.reduce((sum, session) => sum + session.reps, 0)
        const totalBadges = user.userAchievements.length

        // Simple scoring algorithm: 1 badge = 100 points, 1 rep = 1 point
        const score = totalReps + (totalBadges * 100)

        return {
            id: user.id,
            name: user.name || 'Anonymous Lifter',
            image: user.image,
            totalReps,
            totalBadges,
            score
        }
    })

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score)

    // Return the top 50 users
    return Response.json(leaderboard.slice(0, 50))
}
