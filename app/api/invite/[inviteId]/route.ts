import { getBatchById, getInviteById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inviteId } = await params

  const invite = await getInviteById(inviteId)

  if (!invite || !invite.isActive) {
    return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
  }

  const batch = await getBatchById(invite.batchId)

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      inviteId: invite.id,
      batchId: batch.id,
      batchName: batch.name
    }
  })
}
