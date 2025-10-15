#!/usr/bin/env tsx
/**
 * Mark the initial migration as completed
 * This is needed because push mode already created the schema
 */

import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: true } : false,
})

async function markMigrationComplete() {
  try {
    console.log('📝 Checking if migration table exists...')

    // Check if payload_migrations table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'payload_migrations'
      );
    `

    if (!tableExists[0].exists) {
      console.log('⚠️  payload_migrations table does not exist, creating it...')
      await sql`
        CREATE TABLE IF NOT EXISTS "payload_migrations" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" varchar,
          "batch" numeric,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
      `
      console.log('✅ Created payload_migrations table')
    }

    // Check if migration record already exists
    const existing = await sql`
      SELECT * FROM payload_migrations WHERE name = '20251014_033400'
    `

    if (existing.length > 0) {
      console.log('✅ Migration 20251014_033400 is already marked as complete')
    } else {
      // Insert migration record
      await sql`
        INSERT INTO payload_migrations (name, batch, created_at, updated_at)
        VALUES ('20251014_033400', 1, NOW(), NOW())
      `
      console.log('✅ Marked migration 20251014_033400 as complete')
    }

    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error marking migration as complete:', error)
    await sql.end()
    process.exit(1)
  }
}

markMigrationComplete()
