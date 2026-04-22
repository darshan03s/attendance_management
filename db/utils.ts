import { and, eq, isNull } from 'drizzle-orm'
import { db } from '.'
import { batch, user } from './schema'
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
      name: `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Unknown',
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
