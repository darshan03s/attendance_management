import { getSessionsByTrainer, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sessions = await getSessionsByTrainer(userId)

  return NextResponse.json({ data: sessions })
}
