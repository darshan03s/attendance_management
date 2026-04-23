import { addStudentToBatch, checkStudentInBatch, getInviteById, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can join batches' }, { status: 403 })
  }

  const { id: batchId } = await params
  const body = await request.json()
  const { inviteId } = body

  if (!inviteId) {
    return NextResponse.json({ error: 'Missing required field: inviteId' }, { status: 400 })
  }

  const invite = await getInviteById(inviteId)

  if (!invite || !invite.isActive) {
    return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
  }

  // Ensure the invite actually belongs to this batch
  if (invite.batchId !== batchId) {
    return NextResponse.json({ error: 'Invite does not belong to this batch' }, { status: 400 })
  }

  const existing = await checkStudentInBatch(batchId, userId)

  if (existing) {
    return NextResponse.json({ error: 'You have already joined this batch' }, { status: 409 })
  }

  await addStudentToBatch(batchId, userId)

  return NextResponse.json({ data: { success: true } }, { status: 201 })
}
