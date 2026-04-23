import {
  createSession,
  getOverlappingSessions,
  getTrainerBatchAssignment,
  getUserById
} from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { batchId, name, date, startTime, endTime } = body

  if (!batchId || !date || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'Missing required fields: batchId, date, startTime, endTime' },
      { status: 400 }
    )
  }

  // Validate endTime is after startTime
  if (endTime <= startTime) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  // Validate trainer is assigned to this batch
  const assignment = await getTrainerBatchAssignment(batchId, userId)

  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this batch' }, { status: 403 })
  }

  // Check for overlapping sessions in the same batch on the same date
  const overlapping = await getOverlappingSessions(batchId, date, startTime, endTime)

  if (overlapping.length > 0) {
    return NextResponse.json(
      { error: 'This session overlaps with an existing session in this batch' },
      { status: 409 }
    )
  }

  const [created] = await createSession(batchId, userId, date, startTime, endTime, name)

  return NextResponse.json({ data: created }, { status: 201 })
}
