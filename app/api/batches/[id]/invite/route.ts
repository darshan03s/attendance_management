import {
  createBatchInvite,
  getActiveInviteByBatch,
  getTrainerBatchAssignment,
  getUserById
} from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: batchId } = await params

  const assignment = await getTrainerBatchAssignment(batchId, userId)

  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this batch' }, { status: 403 })
  }

  const invite = await getActiveInviteByBatch(batchId)

  if (!invite) {
    return NextResponse.json({ data: { inviteId: null } })
  }

  return NextResponse.json({ data: { inviteId: invite.id } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: batchId } = await params

  const assignment = await getTrainerBatchAssignment(batchId, userId)

  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this batch' }, { status: 403 })
  }

  const newInvite = await createBatchInvite(batchId, userId)

  return NextResponse.json({ data: { inviteId: newInvite[0].id } }, { status: 201 })
}
