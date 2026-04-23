import {
  checkStudentInBatch,
  getAttendanceBySessionAndStudent,
  getSessionById,
  getUserById,
  markAttendance
} from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { sessionId } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  // Validate session exists
  const sessionData = await getSessionById(sessionId)
  if (!sessionData) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const isStudentInBatch = await checkStudentInBatch(sessionData.batchId, userId)

  if (!isStudentInBatch) {
    return NextResponse.json({ error: 'You are not enrolled in this batch' }, { status: 403 })
  }

  // Check if already marked
  const existing = await getAttendanceBySessionAndStudent(sessionId, userId)
  if (existing) {
    return NextResponse.json({ error: 'Attendance already marked' }, { status: 409 })
  }

  // Compute time windows
  const sessionStart = new Date(`${sessionData.date}T${sessionData.startTime}:00+05:30`)
  const sessionEnd = new Date(`${sessionData.date}T${sessionData.endTime}:00+05:30`)

  const lateThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000) // +15 minutes
  const now = new Date()

  // Time-based rules
  if (now < sessionStart) {
    return NextResponse.json({ error: 'Session not started' }, { status: 400 })
  }

  if (now > sessionEnd) {
    return NextResponse.json({ error: 'Attendance window closed' }, { status: 400 })
  }

  // Determine status: present if within 15 min of start, late otherwise
  const status: 'present' | 'late' = now <= lateThreshold ? 'present' : 'late'

  const result = await markAttendance(sessionId, userId, status)

  return NextResponse.json({ data: result })
}
