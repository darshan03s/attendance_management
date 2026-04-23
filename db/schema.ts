import { boolean, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  role: userRole('role').default('student').notNull(),
  institutionId: text('institutionId')
})

export const batch = pgTable('batch', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  institutionId: text('institutionId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow()
})

export const batchTrainers = pgTable(
  'batch_trainers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    batchId: text('batchId')
      .notNull()
      .references(() => batch.id, { onDelete: 'cascade' }),
    trainerId: text('trainerId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (t) => [unique().on(t.batchId, t.trainerId)]
)

export const batchStudents = pgTable(
  'batch_students',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    batchId: text('batchId')
      .notNull()
      .references(() => batch.id, { onDelete: 'cascade' }),
    studentId: text('studentId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (t) => [unique().on(t.batchId, t.studentId)]
)

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  batchId: text('batchId')
    .notNull()
    .references(() => batch.id, { onDelete: 'cascade' }),
  trainerId: text('trainerId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  date: text('date').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const attendanceStatus = pgEnum('attendance_status', ['present', 'absent', 'late'])

export const attendance = pgTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    sessionId: text('sessionId')
      .notNull()
      .references(() => session.id, { onDelete: 'cascade' }),
    studentId: text('studentId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: attendanceStatus('status').notNull(),
    markedAt: timestamp('markedAt').defaultNow()
  },
  (t) => [unique().on(t.sessionId, t.studentId)]
)

export const batchInvite = pgTable('batch_invite', {
  id: text('id').primaryKey(),
  batchId: text('batchId')
    .notNull()
    .references(() => batch.id, { onDelete: 'cascade' }),
  createdBy: text('createdBy')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  isActive: boolean('isActive').default(true)
})
