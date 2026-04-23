import { getStudentsByBatch, getTrainerBatchAssignment, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { batchId } = await params

  // Validate trainer is assigned to this batch
  const assignment = await getTrainerBatchAssignment(batchId, userId)

  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this batch' }, { status: 403 })
  }

  const students = await getStudentsByBatch(batchId)

  return NextResponse.json({
    data: students.map((s) => ({ id: s.id, name: s.name, email: s.email }))
  })
}
