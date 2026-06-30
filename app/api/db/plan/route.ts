import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

const DEFAULT_USER_ID = 'default-user'

// GET /api/db/plan — load the latest workout plan
export async function GET() {
    const plan = await prisma.workoutPlan.findFirst({
        where: { userId: DEFAULT_USER_ID },
        orderBy: { generatedAt: 'desc' },
    })

    if (!plan) return Response.json(null)

    return Response.json({
        id: plan.id,
        split: plan.split,
        days: JSON.parse(plan.daysJson),
        generatedAt: plan.generatedAt.toISOString(),
    })
}

// POST /api/db/plan — save a workout plan
export async function POST(request: NextRequest) {
    const body = await request.json()

    const plan = await prisma.workoutPlan.create({
        data: {
            userId: DEFAULT_USER_ID,
            split: body.split,
            daysJson: JSON.stringify(body.days),
            generatedAt: body.generatedAt ? new Date(body.generatedAt) : new Date(),
        },
    })

    return Response.json({
        id: plan.id,
        split: plan.split,
        days: JSON.parse(plan.daysJson),
        generatedAt: plan.generatedAt.toISOString(),
    })
}

// DELETE /api/db/plan — clear saved plans
export async function DELETE() {
    await prisma.workoutPlan.deleteMany({
        where: { userId: DEFAULT_USER_ID },
    })
    return Response.json({ success: true })
}
