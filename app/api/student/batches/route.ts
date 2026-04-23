import {
  getAttendanceByStudent,
  getBatchesByStudent,
  getSessionsByBatch,
  getUserById
} from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = clerkUser.id
  const user = await getUserById(userId)

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const batches = await getBatchesByStudent(userId)

  // Enrich batches with their sessions and attendance status
  const batchesWithSessions = await Promise.all(
    batches.map(async (b) => {
      const sessions = await getSessionsByBatch(b.id)
      const sessionIds = sessions.map((s) => s.id)
      const attendanceRecords = await getAttendanceByStudent(userId, sessionIds)
      const attendedSessionIds = new Set(attendanceRecords.map((a) => a.sessionId))

      const sessionsWithAttendance = sessions.map((s) => ({
        ...s,
        attended: attendedSessionIds.has(s.id)
      }))

      return { ...b, sessions: sessionsWithAttendance }
    })
  )

  return NextResponse.json({ data: batchesWithSessions })
}
