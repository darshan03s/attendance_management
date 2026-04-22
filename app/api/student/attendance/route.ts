import { getAttendanceBySessionAndStudent, getUserById, markAttendance } from '@/db/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await getUserById(userId)

  if (!currentUser || currentUser.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { sessionId } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  // Check if already marked
  const existing = await getAttendanceBySessionAndStudent(sessionId, userId)
  if (existing) {
    return NextResponse.json({ error: 'Attendance already marked' }, { status: 409 })
  }

  const result = await markAttendance(sessionId, userId)

  return NextResponse.json({ data: result })
}
