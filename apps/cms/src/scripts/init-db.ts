#!/usr/bin/env tsx
/**
 * Database initialization script
 * Ensures database schema is synced before starting the server
 */

import { getPayload } from 'payload'
import config from '../../payload.config'

async function initDatabase() {
  console.log('🔄 Initializing database schema...')

  try {
    // Initialize Payload - this triggers schema sync with push: true
    const payload = await getPayload({ config })

    console.log('✅ Database schema initialized successfully')

    // Gracefully close the connection
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

initDatabase()
