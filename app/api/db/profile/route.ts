import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/db/profile — load the user's profile
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    
    const userId = session.user.id

    const profile = await prisma.profile.findUnique({
        where: { userId },
    })
    if (!profile) return Response.json(null)

    return Response.json({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        fitnessLevel: profile.fitnessLevel,
        goal: profile.goal,
        daysPerWeek: profile.daysPerWeek,
        equipment: profile.equipment,
        injuries: profile.injuries,
    })
}

// POST /api/db/profile — save/update the user's profile
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    
    const userId = session.user.id
    const body = await request.json()

    const data = {
        userId,
        name: body.name,
        age: body.age,
        gender: body.gender,
        height: body.height,
        weight: body.weight,
        fitnessLevel: body.fitnessLevel,
        goal: body.goal,
        daysPerWeek: body.daysPerWeek,
        equipment: body.equipment,
        injuries: body.injuries || '',
    }

    const profile = await prisma.profile.upsert({
        where: { userId },
        create: data,
        update: data,
    })

    return Response.json({ success: true, id: profile.id })
}
