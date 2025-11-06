/**
 * Create First Admin User Script
 *
 * Directly creates an admin user in the database using Payload's Local API.
 * Use this when the admin UI has compatibility issues.
 *
 * Usage:
 *   pnpm tsx scripts/create-admin-user.ts
 */

// Load environment variables from .env.local
import { config as dotenvConfig } from 'dotenv'
import path from 'path'

dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })
dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

import { getPayload } from 'payload'
import config from '../payload.config'

async function createAdminUser() {
  console.log('🚀 Starting admin user creation...\n')

  try {
    // Get Payload instance
    console.log('📦 Loading Payload config...')
    const payload = await getPayload({ config })
    console.log('✅ Payload initialized\n')

    // Check if any users exist
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.totalDocs > 0) {
      console.log('⚠️  Admin user already exists!')
      console.log(`   Found ${existingUsers.totalDocs} user(s) in database`)
      console.log('\n   Use the login page instead: http://localhost:3000/admin/login')
      process.exit(0)
    }

    // Prompt for admin details
    console.log('📝 Creating first admin user...')
    console.log('   Default credentials will be used:\n')

    const adminEmail = 'admin@verscienta.com'
    const adminPassword = 'admin123456'  // Change this after first login!

    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('\n   ⚠️  IMPORTANT: Change this password immediately after logging in!\n')

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   User ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}\n`)

    console.log('🎉 Setup complete!')
    console.log('\n   Next steps:')
    console.log('   1. Visit: http://localhost:3000/admin/login')
    console.log(`   2. Login with: ${adminEmail} / ${adminPassword}`)
    console.log('   3. Change your password in Settings\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error creating admin user:')
    console.error(error)
    process.exit(1)
  }
}

createAdminUser()
