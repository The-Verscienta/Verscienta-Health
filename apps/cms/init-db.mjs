#!/usr/bin/env node
/**
 * Standalone database initialization script
 * Run with: node init-db.mjs
 */

import { getPayload } from 'payload'
import config from './payload.config.js'

async function initDatabase() {
  console.log('🔄 Initializing database schema...')
  console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗')
  console.log('🔐 Payload Secret:', process.env.PAYLOAD_SECRET ? 'Set ✓' : 'Missing ✗')

  try {
    // Initialize Payload - this triggers schema sync with push: true
    const payload = await getPayload({ config: await config })

    console.log('✅ Database schema initialized successfully')
    console.log('📋 Collections:', payload.config.collections.map(c => c.slug).join(', '))

    // Gracefully close the connection
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

initDatabase()
