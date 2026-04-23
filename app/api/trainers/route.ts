import { getUserById, getUnassignedTrainers } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const trainers = await getUnassignedTrainers()

  return NextResponse.json({ data: { trainers } })
}
