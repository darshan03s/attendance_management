import { addBatchTrainers, getBatchById, getTrainersByBatch, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const batch = await getBatchById(id)

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  if (batch.institutionId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const trainers = await getTrainersByBatch(id)

  return NextResponse.json({ data: { trainers } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const batch = await getBatchById(id)

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  if (batch.institutionId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { trainerIds } = body as { trainerIds: string[] }

  if (!Array.isArray(trainerIds) || trainerIds.length === 0) {
    return NextResponse.json(
      { error: 'trainerIds is required and must be a non-empty array' },
      { status: 400 }
    )
  }

  // Validate each trainer
  for (const trainerId of trainerIds) {
    const trainer = await getUserById(trainerId)

    if (!trainer) {
      return NextResponse.json({ error: `Trainer ${trainerId} not found` }, { status: 404 })
    }

    if (trainer.role !== 'trainer') {
      return NextResponse.json({ error: `User ${trainerId} is not a trainer` }, { status: 400 })
    }

    if (trainer.institutionId !== user.id) {
      return NextResponse.json(
        { error: `Trainer ${trainerId} does not belong to your institution` },
        { status: 400 }
      )
    }
  }

  await addBatchTrainers(id, trainerIds)

  return NextResponse.json({ data: { success: true } }, { status: 201 })
}
