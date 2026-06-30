import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/db/measurements — load measurement history
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const entries = await prisma.measurement.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
    })

    return Response.json(
        entries.map(m => ({
            id: m.id,
            date: m.date.toISOString(),
            weight: m.weight,
            bodyFat: m.bodyFat,
            chest: m.chest,
            waist: m.waist,
            arms: m.arms,
            thighs: m.thighs,
        }))
    )
}

// POST /api/db/measurements — save a measurement
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const entry = await prisma.measurement.create({
        data: {
            userId: session.user.id,
            date: body.date ? new Date(body.date) : new Date(),
            weight: body.weight,
            bodyFat: body.bodyFat ?? null,
            chest: body.chest ?? null,
            waist: body.waist ?? null,
            arms: body.arms ?? null,
            thighs: body.thighs ?? null,
        },
    })

    return Response.json({
        id: entry.id,
        date: entry.date.toISOString(),
        weight: entry.weight,
        bodyFat: entry.bodyFat,
        chest: entry.chest,
        waist: entry.waist,
        arms: entry.arms,
        thighs: entry.thighs,
    })
}

// DELETE /api/db/measurements — delete a measurement by id (passed as query param)
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return Response.json({ error: 'id is required' }, { status: 400 })
    }

    // Optional: check if measurement belongs to user before deleting
    await prisma.measurement.delete({ 
        where: { id } 
    })
    return Response.json({ success: true })
}
