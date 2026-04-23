import { assignTrainerToInstitution, getUserById, getTrainersByInstitution } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { trainerId } = body as { trainerId: string }

  if (!trainerId) {
    return NextResponse.json({ error: 'trainerId is required' }, { status: 400 })
  }

  const trainer = await getUserById(trainerId)

  if (!trainer) {
    return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
  }

  if (trainer.role !== 'trainer') {
    return NextResponse.json({ error: 'User is not a trainer' }, { status: 400 })
  }

  if (trainer.institutionId !== null) {
    return NextResponse.json(
      { error: 'Trainer is already assigned to an institution' },
      { status: 400 }
    )
  }

  const updated = await assignTrainerToInstitution(trainerId, user.id)

  return NextResponse.json({ data: { trainer: updated[0] } }, { status: 200 })
}

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const trainers = await getTrainersByInstitution(user.id)

  return NextResponse.json({ data: { trainers } })
}
