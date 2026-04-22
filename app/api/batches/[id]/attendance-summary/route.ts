import { getBatchAttendanceSummary, getBatchById, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await getUserById(clerkUser.id)

  if (!dbUser || dbUser.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: batchId } = await params

  const batchData = await getBatchById(batchId)
  if (!batchData || batchData.institutionId !== clerkUser.id) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  const summary = await getBatchAttendanceSummary(batchId)

  return NextResponse.json({ data: summary })
}
