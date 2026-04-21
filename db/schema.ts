import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', [
  'student',
  'trainer',
  'institution',
  'programme_manager',
  'monitoring_officer'
])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  role: userRole('role').default('student'),
  institutionId: text('institutionId')
})

export const batch = pgTable('batch', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  institutionId: text('institutionId').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const batchTrainers = pgTable('batch_trainers', {
  batchId: text('batchId').notNull(),
  trainerId: text('trainerId').notNull()
})

export const batchStudents = pgTable('batch_students', {
  batchId: text('batchId').notNull(),
  studentId: text('studentId').notNull()
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  batchId: text('batchId').notNull(),
  trainerId: text('trainerId').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const attendanceStatus = pgEnum('attendance_status', ['present', 'absent', 'late'])

export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  sessionId: text('sessionId').notNull(),
  studentId: text('studentId').notNull(),
  status: attendanceStatus('status').notNull(),
  markedAt: timestamp('markedAt').defaultNow()
})

export const batchInvite = pgTable('batch_invite', {
  id: text('id').primaryKey(),
  batchId: text('batchId').notNull(),
  createdBy: text('createdBy').notNull(),
  isActive: boolean('isActive').default(true)
})
