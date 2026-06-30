import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

const DEFAULT_USER_ID = 'default-user'

// GET /api/db/sessions — load workout history
export async function GET() {
    const sessions = await prisma.workoutSession.findMany({
        where: { userId: DEFAULT_USER_ID },
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
    const body = await request.json()

    const session = await prisma.workoutSession.create({
        data: {
            userId: DEFAULT_USER_ID,
            exercise: body.exercise,
            reps: body.reps,
            avgScore: body.avgScore,
            duration: body.duration,
            side: body.side,
            scoresJson: JSON.stringify(body.scores || []),
        },
    })

    return Response.json({
        id: session.id,
        date: session.date.toISOString(),
        exercise: session.exercise,
        reps: session.reps,
        avgScore: session.avgScore,
        duration: session.duration,
        side: session.side,
        scores: JSON.parse(session.scoresJson),
    })
}
