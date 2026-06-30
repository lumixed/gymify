import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

// For now we use a single default user. Replace with auth later.
const DEFAULT_USER_ID = 'default-user'

async function ensureUser() {
    let user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } })
    if (!user) {
        user = await prisma.user.create({ data: { id: DEFAULT_USER_ID } })
    }
    return user
}

// GET /api/db/profile — load the user's profile
export async function GET() {
    await ensureUser()
    const profile = await prisma.profile.findUnique({
        where: { userId: DEFAULT_USER_ID },
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
    const body = await request.json()
    await ensureUser()

    const data = {
        userId: DEFAULT_USER_ID,
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
        where: { userId: DEFAULT_USER_ID },
        create: data,
        update: data,
    })

    return Response.json({ success: true, id: profile.id })
}
