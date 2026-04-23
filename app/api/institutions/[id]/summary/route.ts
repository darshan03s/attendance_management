import { getInstitutionAttendanceSummary, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await getUserById(clerkUser.id)

  if (!dbUser || dbUser.role !== 'programme_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: institutionId } = await params

  // Verify institution exists
  const institution = await getUserById(institutionId)
  if (!institution || institution.role !== 'institution') {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
  }

  const summary = await getInstitutionAttendanceSummary(institutionId)

  return NextResponse.json({ data: summary })
}
