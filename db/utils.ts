import { and, eq, inArray, isNull, lt, gt } from 'drizzle-orm'
import { db } from '.'
import {
  attendance,
  batch,
  batchInvite,
  batchStudents,
  batchTrainers,
  session,
  user
} from './schema'
import { UserRole } from '@/types'

export const getUserById = async (userId: string) => {
  return await db.query.user.findFirst({
    where: eq(user.id, userId)
  })
}

export const addNewUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  role: UserRole
) => {
  return await db
    .insert(user)
    .values({
      id: userId,
      name: `${firstName ?? ''} ${lastName ?? ''}`.trim() || email.split('@')[0],
      email: email,
      role
    })
    .returning()
}

export const createBatch = async (name: string, institutionId: string) => {
  return await db
    .insert(batch)
    .values({
      id: crypto.randomUUID(),
      name,
      institutionId
    })
    .returning()
}

export const getBatchesByInstitution = async (institutionId: string) => {
  return await db.query.batch.findMany({
    where: eq(batch.institutionId, institutionId)
  })
}

export const assignTrainerToInstitution = async (trainerId: string, institutionId: string) => {
  return await db.update(user).set({ institutionId }).where(eq(user.id, trainerId)).returning()
}

export const getTrainersByInstitution = async (institutionId: string) => {
  return await db.query.user.findMany({
    where: and(eq(user.role, 'trainer'), eq(user.institutionId, institutionId))
  })
}

export const getUnassignedTrainers = async () => {
  return await db.query.user.findMany({
    where: and(eq(user.role, 'trainer'), isNull(user.institutionId))
  })
}

export const getBatchById = async (batchId: string) => {
  return await db.query.batch.findFirst({
    where: eq(batch.id, batchId)
  })
}

export const addBatchTrainers = async (batchId: string, trainerIds: string[]) => {
  // Get existing assignments to skip duplicates
  const existing = await db.query.batchTrainers.findMany({
    where: eq(batchTrainers.batchId, batchId)
  })
  const existingIds = new Set(existing.map((e) => e.trainerId))
  const newIds = trainerIds.filter((id) => !existingIds.has(id))

  if (newIds.length === 0) return []

  return await db
    .insert(batchTrainers)
    .values(newIds.map((trainerId) => ({ batchId, trainerId })))
    .returning()
}

export const getTrainersByBatch = async (batchId: string) => {
  const assignments = await db.query.batchTrainers.findMany({
    where: eq(batchTrainers.batchId, batchId)
  })

  if (assignments.length === 0) return []

  const trainerIds = assignments.map((a) => a.trainerId)
  return await db.query.user.findMany({
    where: inArray(user.id, trainerIds)
  })
}

export const getTrainerBatchAssignment = async (batchId: string, trainerId: string) => {
  return await db.query.batchTrainers.findFirst({
    where: and(eq(batchTrainers.batchId, batchId), eq(batchTrainers.trainerId, trainerId))
  })
}

export const getBatchesByTrainer = async (trainerId: string) => {
  const assignments = await db.query.batchTrainers.findMany({
    where: eq(batchTrainers.trainerId, trainerId)
  })

  if (assignments.length === 0) return []

  const batchIds = assignments.map((a) => a.batchId)
  return await db.query.batch.findMany({
    where: inArray(batch.id, batchIds)
  })
}

export const getActiveInviteByBatch = async (batchId: string) => {
  return await db.query.batchInvite.findFirst({
    where: and(eq(batchInvite.batchId, batchId), eq(batchInvite.isActive, true))
  })
}

export const deactivateInvitesByBatch = async (batchId: string) => {
  return await db
    .update(batchInvite)
    .set({ isActive: false })
    .where(and(eq(batchInvite.batchId, batchId), eq(batchInvite.isActive, true)))
}

export const createBatchInvite = async (batchId: string, trainerId: string) => {
  await deactivateInvitesByBatch(batchId)
  return await db
    .insert(batchInvite)
    .values({ id: crypto.randomUUID(), batchId, createdBy: trainerId })
    .returning()
}

export const getInviteById = async (inviteId: string) => {
  return await db.query.batchInvite.findFirst({
    where: eq(batchInvite.id, inviteId)
  })
}

export const checkStudentInBatch = async (batchId: string, studentId: string) => {
  return await db.query.batchStudents.findFirst({
    where: and(eq(batchStudents.batchId, batchId), eq(batchStudents.studentId, studentId))
  })
}

export const addStudentToBatch = async (batchId: string, studentId: string) => {
  return await db.insert(batchStudents).values({ batchId, studentId }).returning()
}

export const getBatchesByStudent = async (studentId: string) => {
  const assignments = await db.query.batchStudents.findMany({
    where: eq(batchStudents.studentId, studentId)
  })

  if (assignments.length === 0) return []

  const batchIds = assignments.map((a) => a.batchId)
  return await db.query.batch.findMany({
    where: inArray(batch.id, batchIds)
  })
}

export const createSession = async (
  batchId: string,
  trainerId: string,
  date: string,
  startTime: string,
  endTime: string,
  name?: string
) => {
  return await db
    .insert(session)
    .values({
      id: crypto.randomUUID(),
      batchId,
      trainerId,
      title: name || `Session - ${date}`,
      date,
      startTime,
      endTime
    })
    .returning()
}

export const getOverlappingSessions = async (
  batchId: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  return await db.query.session.findMany({
    where: and(
      eq(session.batchId, batchId),
      eq(session.date, date),
      lt(session.startTime, endTime),
      gt(session.endTime, startTime)
    )
  })
}

export const getSessionsByTrainer = async (trainerId: string) => {
  const sessions = await db.query.session.findMany({
    where: eq(session.trainerId, trainerId)
  })

  if (sessions.length === 0) return []

  // Enrich with batch names
  const batchIds = [...new Set(sessions.map((s) => s.batchId))]
  const batches = await db.query.batch.findMany({
    where: inArray(batch.id, batchIds)
  })
  const batchMap = new Map(batches.map((b) => [b.id, b.name]))

  return sessions.map((s) => ({
    ...s,
    batchName: batchMap.get(s.batchId) ?? 'Unknown'
  }))
}

export const getSessionsByBatch = async (batchId: string) => {
  return await db.query.session.findMany({
    where: eq(session.batchId, batchId)
  })
}

export const getSessionById = async (sessionId: string) => {
  return await db.query.session.findFirst({
    where: eq(session.id, sessionId)
  })
}

export const markAttendance = async (
  sessionId: string,
  studentId: string,
  status: 'present' | 'late' = 'present'
) => {
  // Check if already marked
  const existing = await db.query.attendance.findFirst({
    where: and(eq(attendance.sessionId, sessionId), eq(attendance.studentId, studentId))
  })

  if (existing) return existing

  return await db
    .insert(attendance)
    .values({
      id: crypto.randomUUID(),
      sessionId,
      studentId,
      status
    })
    .returning()
}

export const getAttendanceBySessionAndStudent = async (sessionId: string, studentId: string) => {
  return await db.query.attendance.findFirst({
    where: and(eq(attendance.sessionId, sessionId), eq(attendance.studentId, studentId))
  })
}

export const getAttendanceByStudent = async (studentId: string, sessionIds: string[]) => {
  if (sessionIds.length === 0) return []
  return await db.query.attendance.findMany({
    where: and(eq(attendance.studentId, studentId), inArray(attendance.sessionId, sessionIds))
  })
}

export const getStudentsByBatch = async (batchId: string) => {
  const assignments = await db.query.batchStudents.findMany({
    where: eq(batchStudents.batchId, batchId)
  })

  if (assignments.length === 0) return []

  const studentIds = assignments.map((a) => a.studentId)
  return await db.query.user.findMany({
    where: inArray(user.id, studentIds)
  })
}

export const getAttendanceBySession = async (sessionId: string) => {
  return await db.query.attendance.findMany({
    where: eq(attendance.sessionId, sessionId)
  })
}

export const getAllInstitutions = async () => {
  return await db.query.user.findMany({
    where: eq(user.role, 'institution')
  })
}

export const getInstitutionAttendanceSummary = async (institutionId: string) => {
  // 1. Get all batches for this institution
  const batches = await db.query.batch.findMany({
    where: eq(batch.institutionId, institutionId)
  })

  const totalBatches = batches.length
  if (totalBatches === 0) {
    return {
      totalBatches: 0,
      totalSessions: 0,
      totalSlots: 0,
      presentCount: 0,
      lateCount: 0,
      presentPercent: 0,
      latePercent: 0,
      absentPercent: 0
    }
  }

  let totalSessions = 0
  let totalSlots = 0
  let presentCount = 0
  let lateCount = 0

  const now = new Date()

  // 2. For each batch, aggregate counts
  for (const b of batches) {
    const allSessions = await db.query.session.findMany({
      where: eq(session.batchId, b.id)
    })

    // Only completed sessions
    const completedSessions = allSessions.filter((s) => {
      const sessionEnd = new Date(`${s.date}T${s.endTime}`)
      return sessionEnd <= now
    })

    const batchSessionCount = completedSessions.length
    if (batchSessionCount === 0) continue

    const studentAssignments = await db.query.batchStudents.findMany({
      where: eq(batchStudents.batchId, b.id)
    })

    const batchStudentCount = studentAssignments.length
    if (batchStudentCount === 0) {
      totalSessions += batchSessionCount
      continue
    }

    totalSessions += batchSessionCount
    totalSlots += batchSessionCount * batchStudentCount

    const sessionIds = completedSessions.map((s) => s.id)
    const attendanceRecords = await db.query.attendance.findMany({
      where: inArray(attendance.sessionId, sessionIds)
    })

    for (const record of attendanceRecords) {
      if (record.status === 'present') presentCount++
      else if (record.status === 'late') lateCount++
    }
  }

  if (totalSlots === 0) {
    return {
      totalBatches,
      totalSessions,
      totalSlots: 0,
      presentCount: 0,
      lateCount: 0,
      presentPercent: 0,
      latePercent: 0,
      absentPercent: 0
    }
  }

  const presentPercent = Math.round((presentCount / totalSlots) * 100)
  const latePercent = Math.round((lateCount / totalSlots) * 100)
  const absentPercent = 100 - presentPercent - latePercent

  return {
    totalBatches,
    totalSessions,
    totalSlots,
    presentCount,
    lateCount,
    presentPercent,
    latePercent,
    absentPercent
  }
}

export const getProgrammeAttendanceSummary = async () => {
  const institutions = await getAllInstitutions()

  const totalInstitutions = institutions.length

  let totalBatches = 0
  let totalSessions = 0
  let totalSlots = 0
  let presentCount = 0
  let lateCount = 0

  const institutionDetails: {
    institutionId: string
    name: string
    totalBatches: number
    totalSessions: number
    presentPercent: number
    latePercent: number
    absentPercent: number
  }[] = []

  for (const inst of institutions) {
    const summary = await getInstitutionAttendanceSummary(inst.id)

    totalBatches += summary.totalBatches
    totalSessions += summary.totalSessions
    totalSlots += summary.totalSlots
    presentCount += summary.presentCount
    lateCount += summary.lateCount

    institutionDetails.push({
      institutionId: inst.id,
      name: inst.name,
      totalBatches: summary.totalBatches,
      totalSessions: summary.totalSessions,
      presentPercent: summary.presentPercent,
      latePercent: summary.latePercent,
      absentPercent: summary.absentPercent
    })
  }

  let overallPresentPercent = 0
  let overallLatePercent = 0
  let overallAbsentPercent = 0

  if (totalSlots > 0) {
    overallPresentPercent = Math.round((presentCount / totalSlots) * 100)
    overallLatePercent = Math.round((lateCount / totalSlots) * 100)
    overallAbsentPercent = 100 - overallPresentPercent - overallLatePercent
  }

  return {
    overall: {
      totalInstitutions,
      totalBatches,
      totalSessions,
      presentPercent: overallPresentPercent,
      latePercent: overallLatePercent,
      absentPercent: overallAbsentPercent
    },
    institutions: institutionDetails
  }
}

export const getBatchAttendanceSummary = async (batchId: string) => {
  const allSessions = await db.query.session.findMany({
    where: eq(session.batchId, batchId)
  })

  // Only consider completed sessions (end time has passed)
  const now = new Date()
  const sessions = allSessions.filter((s) => {
    const sessionEnd = new Date(`${s.date}T${s.endTime}`)
    return sessionEnd <= now
  })

  const totalSessions = sessions.length
  if (totalSessions === 0) {
    return { totalSessions: 0, presentPercent: 0, latePercent: 0, absentPercent: 0 }
  }

  const studentAssignments = await db.query.batchStudents.findMany({
    where: eq(batchStudents.batchId, batchId)
  })

  const totalStudents = studentAssignments.length
  if (totalStudents === 0) {
    return { totalSessions, presentPercent: 0, latePercent: 0, absentPercent: 0 }
  }

  const sessionIds = sessions.map((s) => s.id)
  const attendanceRecords = await db.query.attendance.findMany({
    where: inArray(attendance.sessionId, sessionIds)
  })

  // Total possible attendance slots = sessions * students
  const totalSlots = totalSessions * totalStudents

  let presentCount = 0
  let lateCount = 0

  for (const record of attendanceRecords) {
    if (record.status === 'present') presentCount++
    else if (record.status === 'late') lateCount++
  }

  const presentPercent = Math.round((presentCount / totalSlots) * 100)
  const latePercent = Math.round((lateCount / totalSlots) * 100)
  const absentPercent = 100 - presentPercent - latePercent

  return {
    totalSessions,
    presentPercent,
    latePercent,
    absentPercent
  }
}
