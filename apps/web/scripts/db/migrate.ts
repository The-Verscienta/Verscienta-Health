#!/usr/bin/env tsx
/**
 * Database Migration Script
 *
 * Manages both Prisma migrations (Better Auth tables) and Payload migrations (CMS tables)
 *
 * Usage:
 *   pnpm db:migrate up          # Run pending migrations
 *   pnpm db:migrate down         # Rollback last migration
 *   pnpm db:migrate status       # Check migration status
 *   pnpm db:migrate create NAME  # Create new migration
 */

import { execSync } from 'child_process'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message: string) {
  log(`✓ ${message}`, 'green')
}

function error(message: string) {
  log(`✗ ${message}`, 'red')
}

function info(message: string) {
  log(`ℹ ${message}`, 'blue')
}

function warning(message: string) {
  log(`⚠ ${message}`, 'yellow')
}

/**
 * Run Prisma migrations (Better Auth tables)
 */
function runPrismaMigrations(action: 'up' | 'down' | 'status') {
  log('\n' + '='.repeat(50), 'cyan')
  log('  Prisma Migrations (Better Auth Tables)', 'cyan')
  log('='.repeat(50) + '\n', 'cyan')

  try {
    switch (action) {
      case 'up':
        info('Running Prisma migrations...')
        execSync('pnpm prisma migrate deploy', {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        success('Prisma migrations completed')
        break

      case 'status':
        info('Checking Prisma migration status...')
        execSync('pnpm prisma migrate status', {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        break

      case 'down':
        warning('Prisma does not support automatic rollback')
        info('To rollback Prisma migrations:')
        info('1. Use "prisma migrate resolve" to mark migrations')
        info('2. Manually apply rollback SQL')
        info('3. Or restore from database backup')
        break
    }
  } catch (err: any) {
    error(`Prisma migration failed: ${err.message}`)
    throw err
  }
}

/**
 * Run Payload migrations (CMS tables)
 */
function runPayloadMigrations(action: 'up' | 'down' | 'status') {
  log('\n' + '='.repeat(50), 'cyan')
  log('  Payload Migrations (CMS Tables)', 'cyan')
  log('='.repeat(50) + '\n', 'cyan')

  try {
    switch (action) {
      case 'up':
        info('Running Payload migrations...')
        execSync('pnpm payload migrate', {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        success('Payload migrations completed')
        break

      case 'status':
        info('Checking Payload migration status...')
        execSync('pnpm payload migrate:status', {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        break

      case 'down':
        info('Rolling back Payload migrations...')
        execSync('pnpm payload migrate:down', {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        success('Payload migration rolled back')
        break
    }
  } catch (err: any) {
    if (err.message.includes('No migrations to run') || err.message.includes('up to date')) {
      success('Payload schema is up to date')
    } else {
      error(`Payload migration failed: ${err.message}`)
      throw err
    }
  }
}

/**
 * Create a new migration
 */
function createMigration(name: string, type: 'prisma' | 'payload' | 'both') {
  log('\n' + '='.repeat(50), 'cyan')
  log('  Creating New Migration', 'cyan')
  log('='.repeat(50) + '\n', 'cyan')

  if (!name) {
    error('Migration name is required')
    info('Usage: pnpm db:migrate create <name>')
    process.exit(1)
  }

  try {
    if (type === 'prisma' || type === 'both') {
      info(`Creating Prisma migration: ${name}`)
      execSync(`pnpm prisma migrate dev --name ${name}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      success(`Prisma migration created: ${name}`)
    }

    if (type === 'payload' || type === 'both') {
      info(`Creating Payload migration: ${name}`)
      execSync(`pnpm payload migrate:create`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      success(`Payload migration created`)
    }
  } catch (err: any) {
    error(`Migration creation failed: ${err.message}`)
    throw err
  }
}

/**
 * Show migration status
 */
function showStatus() {
  log('\n' + '='.repeat(50), 'bright')
  log('  Database Migration Status', 'bright')
  log('='.repeat(50) + '\n', 'bright')

  try {
    // Prisma status
    runPrismaMigrations('status')

    // Payload status
    runPayloadMigrations('status')

    log('\n' + '='.repeat(50), 'green')
    log('  Migration Status Check Complete', 'green')
    log('='.repeat(50) + '\n', 'green')
  } catch (err) {
    error('Failed to check migration status')
    process.exit(1)
  }
}

/**
 * Run migrations (up)
 */
function runMigrations() {
  log('\n' + '╔' + '═'.repeat(48) + '╗', 'bright')
  log('  ║' + '  Database Migration Runner'.padEnd(48) + '║', 'bright')
  log('  ╚' + '═'.repeat(48) + '╝\n', 'bright')

  try {
    // Run Prisma migrations first (auth tables)
    runPrismaMigrations('up')

    // Then run Payload migrations (CMS tables)
    runPayloadMigrations('up')

    log('\n' + '╔' + '═'.repeat(48) + '╗', 'green')
    log('  ║' + '  All Migrations Completed Successfully! ✓'.padEnd(48) + '║', 'green')
    log('  ╚' + '═'.repeat(48) + '╝\n', 'green')

    info('Next steps:')
    info('1. Verify database schema: pnpm db:verify')
    info('2. Run database seeders (if needed): pnpm seed')
    info('3. Check index usage: pnpm db:monitor')
  } catch (err) {
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'red')
    log('  ║' + '  Migration Failed ✗'.padEnd(48) + '║', 'red')
    log('  ╚' + '═'.repeat(48) + '╝\n', 'red')

    error('Migration failed. Database may be in an inconsistent state.')
    warning('To rollback: pnpm db:migrate down')
    warning('Or restore from backup if available')
    process.exit(1)
  }
}

/**
 * Rollback migrations (down)
 */
function rollbackMigrations() {
  log('\n' + '╔' + '═'.repeat(48) + '╗', 'yellow')
  log('  ║' + '  Database Migration Rollback'.padEnd(48) + '║', 'yellow')
  log('  ╚' + '═'.repeat(48) + '╝\n', 'yellow')

  warning('This will rollback the last migration!')
  warning('Make sure you have a database backup before proceeding.')

  try {
    // Rollback Payload migrations first
    runPayloadMigrations('down')

    // Prisma doesn't support automatic rollback
    runPrismaMigrations('down')

    log('\n' + '╔' + '═'.repeat(48) + '╗', 'green')
    log('  ║' + '  Rollback Completed'.padEnd(48) + '║', 'green')
    log('  ╚' + '═'.repeat(48) + '╝\n', 'green')
  } catch (err) {
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'red')
    log('  ║' + '  Rollback Failed ✗'.padEnd(48) + '║', 'red')
    log('  ╚' + '═'.repeat(48) + '╝\n', 'red')

    error('Rollback failed. You may need to restore from backup.')
    process.exit(1)
  }
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const subcommand = args[1]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    log('\nDatabase Migration CLI\n', 'bright')
    log('Usage:', 'cyan')
    log('  pnpm db:migrate up              Run all pending migrations')
    log('  pnpm db:migrate down            Rollback last migration')
    log('  pnpm db:migrate status          Check migration status')
    log('  pnpm db:migrate create <name>   Create new migration')
    log('')
    log('Examples:', 'cyan')
    log('  pnpm db:migrate up              # Deploy to production')
    log('  pnpm db:migrate status          # Check what needs to run')
    log('  pnpm db:migrate create add_herb_fields')
    log('')
    return
  }

  switch (command) {
    case 'up':
    case 'deploy':
      runMigrations()
      break

    case 'down':
    case 'rollback':
      rollbackMigrations()
      break

    case 'status':
      showStatus()
      break

    case 'create':
      if (!subcommand) {
        error('Migration name required')
        info('Usage: pnpm db:migrate create <name>')
        process.exit(1)
      }
      createMigration(subcommand, 'both')
      break

    default:
      error(`Unknown command: ${command}`)
      info('Run "pnpm db:migrate help" for usage')
      process.exit(1)
  }
}

// Run CLI
main()
