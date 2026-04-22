import { createSession, getTrainerBatchAssignment, getUserById } from '@/db/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { batchId, date, startTime, endTime } = body

  if (!batchId || !date || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'Missing required fields: batchId, date, startTime, endTime' },
      { status: 400 }
    )
  }

  // Validate trainer is assigned to this batch
  const assignment = await getTrainerBatchAssignment(batchId, userId)

  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this batch' }, { status: 403 })
  }

  const [created] = await createSession(batchId, userId, date, startTime, endTime)

  return NextResponse.json({ data: created }, { status: 201 })
}
