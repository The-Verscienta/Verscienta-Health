#!/usr/bin/env node
/**
 * Main Seed Script
 *
 * Generates realistic seed data for local development and testing
 *
 * Usage:
 *   pnpm seed                    # Seed all collections with default counts
 *   pnpm seed --herbs 50         # Seed only herbs with custom count
 *   pnpm seed --all --count 100  # Seed all with custom count
 *   pnpm seed --help             # Show help
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedHerbs } from './herbs'
import { seedFormulas } from './formulas'
import { seedConditions } from './conditions'
import { seedPractitioners } from './practitioners'
import { seedUsers } from './users'
import { seedReviews } from './reviews'
import { log } from './utils'

/**
 * Parse command line arguments
 */
function parseArgs(): {
  collections: string[]
  counts: Record<string, number>
  help: boolean
  clear: boolean
} {
  const args = process.argv.slice(2)
  const collections: string[] = []
  const counts: Record<string, number> = {
    herbs: 20,
    formulas: 8,
    conditions: 14,
    practitioners: 10,
    users: 15,
    reviews: 50,
  }

  let help = false
  let clear = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      help = true
    } else if (arg === '--clear') {
      clear = true
    } else if (arg === '--all') {
      collections.push('all')
    } else if (arg === '--count' && args[i + 1]) {
      const count = parseInt(args[i + 1], 10)
      if (!isNaN(count)) {
        Object.keys(counts).forEach((key) => {
          counts[key] = count
        })
      }
      i++
    } else if (arg.startsWith('--')) {
      const collection = arg.slice(2)
      const nextArg = args[i + 1]

      // Check if next arg is a number (custom count)
      if (nextArg && !nextArg.startsWith('--')) {
        const count = parseInt(nextArg, 10)
        if (!isNaN(count)) {
          counts[collection] = count
          i++
        }
      }

      collections.push(collection)
    }
  }

  // Default to all if no specific collections specified
  if (collections.length === 0 && !help) {
    collections.push('all')
  }

  return { collections, counts, help, clear }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Verscienta Health Seed Script
==============================

Generate realistic seed data for local development and testing.

Usage:
  pnpm seed [options] [collections]

Options:
  --help, -h              Show this help message
  --clear                 Clear existing data before seeding
  --all                   Seed all collections (default)
  --count <number>        Set count for all collections

Collections:
  --users [count]         Seed users (default: 15)
  --herbs [count]         Seed herbs (default: 20)
  --formulas [count]      Seed formulas (default: 8)
  --conditions [count]    Seed conditions (default: 14)
  --practitioners [count] Seed practitioners (default: 10)
  --reviews [count]       Seed reviews (default: 50)

Examples:
  pnpm seed                          # Seed all collections with defaults
  pnpm seed --herbs 50               # Seed only herbs with 50 records
  pnpm seed --all --count 100        # Seed all with 100 records each
  pnpm seed --users --practitioners  # Seed only users and practitioners
  pnpm seed --clear --all            # Clear existing data and reseed

Notes:
  - Default password for all users: Password123!
  - Admin account: admin@verscienta.com
  - Seed data includes realistic relationships between collections
  - Review generation requires users and entities to exist
`)
}

/**
 * Clear collection data
 */
async function clearCollection(payload: any, collection: string): Promise<void> {
  try {
    const { docs } = await payload.find({
      collection,
      limit: 1000,
      depth: 0,
    })

    for (const doc of docs) {
      await payload.delete({
        collection,
        id: doc.id,
      })
    }

    log.success(`Cleared ${docs.length} records from ${collection}`)
  } catch (error: any) {
    log.error(`Failed to clear ${collection}: ${error.message}`)
  }
}

/**
 * Main seed function
 */
async function seed() {
  const { collections, counts, help, clear } = parseArgs()

  if (help) {
    showHelp()
    process.exit(0)
  }

  const startTime = Date.now()

  console.log(`
╔════════════════════════════════════════╗
║   Verscienta Health Seed Generator    ║
╚════════════════════════════════════════╝
`)

  try {
    log.info('Initializing Payload CMS...')
    const payload = await getPayload({ config })
    log.success('Payload initialized successfully')

    const shouldSeedAll = collections.includes('all')

    // Clear data if requested
    if (clear) {
      log.info('Clearing existing data...')
      const clearCollections = shouldSeedAll
        ? ['reviews', 'practitioners', 'conditions', 'formulas', 'herbs', 'users']
        : collections

      for (const collection of clearCollections) {
        await clearCollection(payload, collection)
      }
    }

    // Track created entities for relationships
    let users: any[] = []
    let herbs: any[] = []
    let formulas: any[] = []
    let conditions: any[] = []
    let practitioners: any[] = []
    let reviews: any[] = []

    // Seed in dependency order

    // 1. Users (independent)
    if (shouldSeedAll || collections.includes('users')) {
      users = await seedUsers(payload, counts.users)
    }

    // 2. Herbs (independent)
    if (shouldSeedAll || collections.includes('herbs')) {
      herbs = await seedHerbs(payload, counts.herbs)
    }

    // 3. Formulas (depends on herbs)
    if (shouldSeedAll || collections.includes('formulas')) {
      formulas = await seedFormulas(payload, herbs, counts.formulas)
    }

    // 4. Conditions (depends on herbs)
    if (shouldSeedAll || collections.includes('conditions')) {
      conditions = await seedConditions(payload, herbs, counts.conditions)
    }

    // 5. Practitioners (independent)
    if (shouldSeedAll || collections.includes('practitioners')) {
      practitioners = await seedPractitioners(payload, counts.practitioners)
    }

    // 6. Reviews (depends on users + entities)
    if (shouldSeedAll || collections.includes('reviews')) {
      reviews = await seedReviews(
        payload,
        {
          users,
          herbs,
          formulas,
          practitioners,
        },
        counts.reviews
      )
    }

    // Summary
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`
╔════════════════════════════════════════╗
║         Seeding Complete! 🎉          ║
╚════════════════════════════════════════╝

Summary:
  Users:         ${users.length}
  Herbs:         ${herbs.length}
  Formulas:      ${formulas.length}
  Conditions:    ${conditions.length}
  Practitioners: ${practitioners.length}
  Reviews:       ${reviews.length}

  Total:         ${users.length + herbs.length + formulas.length + conditions.length + practitioners.length + reviews.length} records
  Duration:      ${duration}s

Login Credentials:
  Email:    admin@verscienta.com
  Password: Password123!

Next Steps:
  - Start the dev server: pnpm dev
  - Access the admin panel: http://localhost:3000/admin
  - View the frontend: http://localhost:3000
`)

    process.exit(0)
  } catch (error: any) {
    log.error(`Seed failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Run seed script
seed()
