import { addStudentToBatch, checkStudentInBatch, getInviteById, getUserById } from '@/db/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'student') {
    return NextResponse.json({ error: 'Only students can join batches' }, { status: 403 })
  }

  const { inviteId } = await params

  const invite = await getInviteById(inviteId)

  if (!invite || !invite.isActive) {
    return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
  }

  const existing = await checkStudentInBatch(invite.batchId, userId)

  if (existing) {
    return NextResponse.json({ error: 'You have already joined this batch' }, { status: 409 })
  }

  await addStudentToBatch(invite.batchId, userId)

  return NextResponse.json({ data: { success: true } }, { status: 201 })
}
