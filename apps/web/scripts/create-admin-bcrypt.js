/**
 * Create First Admin User - Direct Database Insert
 *
 * This bypasses the Payload admin UI which has compatibility issues
 * with Next.js 15.x and creates the user directly in the database.
 *
 * Usage: node scripts/create-admin-bcrypt.js
 */

const bcrypt = require('bcryptjs')
const { Client } = require('pg')

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const adminEmail = 'admin@verscienta.com'
const adminPassword = 'admin123456' // Change this after first login!

async function createAdminUser() {
  console.log('🚀 Creating admin user directly in database...\n')

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Check if user already exists
    const checkResult = await client.query('SELECT COUNT(*) as count FROM users WHERE email = $1', [
      adminEmail,
    ])

    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('⚠️  Admin user already exists!')
      console.log(`   Email: ${adminEmail}`)
      console.log('\n   Use the login page: http://localhost:3000/admin/login\n')
      await client.end()
      return
    }

    // Hash the password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    console.log('✅ Password hashed\n')

    // Insert admin user
    console.log('📝 Creating admin user...')
    const insertResult = await client.query(
      `INSERT INTO users (email, "firstName", "lastName", role, password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, "firstName", "lastName", role`,
      [adminEmail, 'Admin', 'User', 'admin', hashedPassword]
    )

    const user = insertResult.rows[0]
    console.log('✅ Admin user created successfully!\n')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.firstName} ${user.lastName}`)
    console.log(`   Role: ${user.role}\n`)

    console.log('🎉 Setup complete!\n')
    console.log('   Next steps:')
    console.log('   1. Visit: http://localhost:3000/admin/login')
    console.log(`   2. Login with: ${adminEmail} / ${adminPassword}`)
    console.log('   3. Change your password in Settings\n')
    console.log('   ⚠️  IMPORTANT: Change the default password immediately!\n')

    await client.end()
  } catch (error) {
    console.error('\n❌ Error creating admin user:')
    console.error(error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure PostgreSQL is running')
    console.error('2. Check DATABASE_URL in .env.local')
    console.error('3. Verify the users table exists\n')
    process.exit(1)
  }
}

createAdminUser()
