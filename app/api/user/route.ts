import { addNewUser, getUserById } from '@/db/utils'
import { UserRole } from '@/types'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const VALID_ROLES: UserRole[] = [
  'student',
  'trainer',
  'institution',
  'programme_manager',
  'monitoring_officer'
]

export async function POST(request: Request) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { role } = body as { role: UserRole }

  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Check if user already exists
  const existingUser = await getUserById(clerkUser.id)

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const newUser = await addNewUser(
    clerkUser.id,
    clerkUser.firstName ?? '',
    clerkUser.lastName ?? '',
    clerkUser.emailAddresses[0]?.emailAddress ?? '',
    role
  )

  return NextResponse.json(newUser[0], { status: 201 })
}

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingUser = await getUserById(clerkUser.id)

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(existingUser)
}
