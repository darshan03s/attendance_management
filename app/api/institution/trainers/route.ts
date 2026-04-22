import { assignTrainerToInstitution, getUserById, getTrainersByInstitution } from '@/db/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'institution') {
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

  const updated = await assignTrainerToInstitution(trainerId, currentUser.id)

  return NextResponse.json({ data: { trainer: updated[0] } }, { status: 200 })
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const trainers = await getTrainersByInstitution(currentUser.id)

  return NextResponse.json({ data: { trainers } })
}
