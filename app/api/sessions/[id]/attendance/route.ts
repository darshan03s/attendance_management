import {
  getAttendanceBySession,
  getSessionById,
  getStudentsByBatch,
  getTrainerBatchAssignment,
  getUserById
} from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: sessionId } = await params

  // Validate session exists
  const sessionData = await getSessionById(sessionId)
  if (!sessionData) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Validate trainer is assigned to session's batch
  const assignment = await getTrainerBatchAssignment(sessionData.batchId, userId)
  if (!assignment) {
    return NextResponse.json({ error: 'Not authorized for this batch' }, { status: 403 })
  }

  // Fetch all students in the batch
  const students = await getStudentsByBatch(sessionData.batchId)

  // Fetch attendance records for this session
  const attendanceRecords = await getAttendanceBySession(sessionId)
  const attendanceMap = new Map(attendanceRecords.map((a) => [a.studentId, a.status]))

  // Build response: derive absent for missing records
  const result = students.map((student) => ({
    studentId: student.id,
    name: student.name,
    status: attendanceMap.get(student.id) ?? 'absent'
  }))

  return NextResponse.json({ data: { students: result } })
}
