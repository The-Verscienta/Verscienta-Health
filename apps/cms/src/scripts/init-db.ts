#!/usr/bin/env tsx
/**
 * Database initialization script
 * Runs migrations to ensure database schema is up to date
 */

import { migrate } from 'payload/database'
import { getPayload } from 'payload'
import config from '../../payload.config'

async function initDatabase() {
  console.log('🔄 Running database migrations...')
  console.log('📊 NODE_ENV:', process.env.NODE_ENV)

  try {
    // Initialize Payload first
    const payload = await getPayload({ config })
    console.log('✅ Payload initialized successfully')

    // Run migrations
    console.log('📦 Running migrations...')
    await migrate({
      payload,
    })
    console.log('✅ Migrations completed successfully')

    // Verify database connection by checking if we can query
    try {
      const count = await payload.count({
        collection: 'users',
      })
      console.log(`✅ Database verified - users table exists (${count.totalDocs} users)`)
    } catch (error: any) {
      console.error('❌ Database verification failed:', error.message)
      process.exit(1)
    }

    console.log('✅ Database initialization complete')

    // Gracefully close the connection
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

initDatabase()
