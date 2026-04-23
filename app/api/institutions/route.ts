import { getAllInstitutions, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await getUserById(clerkUser.id)

  if (!dbUser || dbUser.role !== 'programme_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const institutions = await getAllInstitutions()

  return NextResponse.json({ data: institutions })
}
