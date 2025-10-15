#!/usr/bin/env tsx
/**
 * Prepare database for initial migration
 * Drops existing enum types so migration can run cleanly
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

async function runInitialMigration() {
  try {
    console.log('📝 Checking if tables exist...')

    // Check if users table exists
    const usersTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `

    if (usersTableExists[0].exists) {
      console.log('✅ Tables already exist, skipping migration')
      await sql.end()
      process.exit(0)
    }

    console.log('⚠️  Tables do not exist, running initial migration...')

    // Drop all existing enum types to allow migration to run cleanly
    console.log('🧹 Dropping existing enum types...')

    const enumTypes = await sql`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `

    for (const enumType of enumTypes) {
      try {
        await sql.unsafe(`DROP TYPE IF EXISTS public."${enumType.typname}" CASCADE`)
        console.log(`  Dropped type: ${enumType.typname}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`  Could not drop type ${enumType.typname}:`, errorMessage)
      }
    }

    console.log('✅ Enum types dropped')

    // Delete any existing migration record
    await sql`
      DELETE FROM payload_migrations WHERE name = '20251014_033400'
    `.catch(() => {
      // Table might not exist yet, ignore error
    })

    // Create payload_migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "payload_migrations" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      );
    `

    console.log('✅ Ready for migration to run')
    console.log('   Payload migrate will now create all schema objects...')

    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error running migration:', error)
    await sql.end()
    process.exit(1)
  }
}

runInitialMigration()
