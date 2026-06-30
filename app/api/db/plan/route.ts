import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/db/plan — load the latest workout plan
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    
    const plan = await prisma.workoutPlan.findFirst({
        where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const plan = await prisma.workoutPlan.create({
        data: {
            userId: session.user.id,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.workoutPlan.deleteMany({
        where: { userId: session.user.id },
    })
    return Response.json({ success: true })
}
