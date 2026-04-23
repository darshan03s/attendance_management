import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const dbURL =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_DEV_URL!
    : process.env.DATABASE_PROD_URL!

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbURL
  }
})
