import { getBatchesByTrainer, getUserById } from '@/db/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const batches = await getBatchesByTrainer(userId)

  return NextResponse.json({ data: batches })
}
