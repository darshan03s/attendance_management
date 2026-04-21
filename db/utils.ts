import { eq } from 'drizzle-orm'
import { db } from '.'
import { user } from './schema'
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
