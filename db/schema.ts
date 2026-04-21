import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

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
  role: userRole('role').default('student')
})
