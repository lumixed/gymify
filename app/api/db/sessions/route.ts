import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/db/sessions — load workout history
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await prisma.workoutSession.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
    })

    return Response.json(
        sessions.map(s => ({
            id: s.id,
            date: s.date.toISOString(),
            exercise: s.exercise,
            reps: s.reps,
            avgScore: s.avgScore,
            duration: s.duration,
            side: s.side,
            scores: JSON.parse(s.scoresJson),
        }))
    )
}

// POST /api/db/sessions — save a workout session
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const workoutSession = await prisma.workoutSession.create({
        data: {
            userId: session.user.id,
            exercise: body.exercise,
            reps: body.reps,
            avgScore: body.avgScore,
            duration: body.duration,
            side: body.side,
            scoresJson: JSON.stringify(body.scores || []),
        },
    })

    return Response.json({
        id: workoutSession.id,
        date: workoutSession.date.toISOString(),
        exercise: workoutSession.exercise,
        reps: workoutSession.reps,
        avgScore: workoutSession.avgScore,
        duration: workoutSession.duration,
        side: workoutSession.side,
        scores: JSON.parse(workoutSession.scoresJson),
    })
}
