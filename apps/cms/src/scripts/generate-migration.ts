#!/usr/bin/env tsx
/**
 * Generate a Payload migration from current config
 * This will create SQL to set up all tables
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

console.log('📦 Generating Payload migration from config...')
console.log('📂 Project root:', projectRoot)

const payloadProcess = spawn('payload', ['migrate:create', '--name', 'initial'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, PAYLOAD_DROP_DATABASE: 'false' },
})

payloadProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Migration generated successfully')
    console.log('   Run migrations with: payload migrate')
    process.exit(0)
  } else {
    console.error('❌ Failed to generate migration')
    process.exit(1)
  }
})
