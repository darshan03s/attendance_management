import { createBatch, getBatchesByInstitution, getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserById(clerkUser.id)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''

  if (!name) {
    return NextResponse.json({ error: 'Batch name is required' }, { status: 400 })
  }

  const newBatch = await createBatch(name, clerkUser.id)

  return NextResponse.json(newBatch[0], { status: 201 })
}

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserById(clerkUser.id)

  if (!user || user.role !== 'institution') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const batches = await getBatchesByInstitution(clerkUser.id)

  return NextResponse.json({ data: batches })
}
