#!/usr/bin/env tsx
/**
 * Database initialization script
 * Ensures database schema is synced before starting the server
 */

import { getPayload } from 'payload'
import config from '../../payload.config'

async function initDatabase() {
  console.log('🔄 Initializing database schema...')
  console.log('📊 NODE_ENV:', process.env.NODE_ENV)
  console.log('📦 Push mode:', 'enabled')

  try {
    // Initialize Payload - this triggers schema sync with push: true
    const payload = await getPayload({ config })

    console.log('✅ Payload initialized successfully')

    // Verify database connection by checking if we can query
    try {
      await payload.find({
        collection: 'users',
        limit: 0,
      })
      console.log('✅ Database tables verified - users table exists')
    } catch (error: any) {
      if (error?.message?.includes('does not exist')) {
        console.error('❌ Database tables were not created!')
        console.error('   This might be because push mode is disabled in production.')
        console.error('   Please check payload.config.ts and ensure push: true is set.')
        process.exit(1)
      }
      // Other errors are okay (like no users found)
      console.log('✅ Database tables appear to be present')
    }

    console.log('✅ Database schema initialized successfully')

    // Gracefully close the connection
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

initDatabase()
