import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema'

const dbURL =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_DEV_URL!
    : process.env.DATABASE_PROD_URL!

export const db = drizzle(dbURL, { schema })
