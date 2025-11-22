/**
 * User Seed Data Generator
 */

import type { Payload } from 'payload'
import { randomInt, randomItem, randomPhone, randomPastDate, log } from './utils'

const USER_DATA = [
  // Admin users
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@verscienta.com',
    role: 'admin',
  },
  {
    firstName: 'Sarah',
    lastName: 'Administrator',
    email: 'sarah.admin@verscienta.com',
    role: 'admin',
  },

  // Editor users
  {
    firstName: 'Michael',
    lastName: 'Editor',
    email: 'michael.editor@verscienta.com',
    role: 'editor',
  },
  {
    firstName: 'Lisa',
    lastName: 'Content',
    email: 'lisa.content@verscienta.com',
    role: 'editor',
  },

  // Practitioner users
  {
    firstName: 'Dr. Sarah',
    lastName: 'Chen',
    email: 'dr.sarah.chen@example.com',
    role: 'practitioner',
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Rodriguez',
    email: 'dr.michael.rodriguez@example.com',
    role: 'practitioner',
  },
  {
    firstName: 'Dr. Emily',
    lastName: 'Thompson',
    email: 'dr.emily.thompson@example.com',
    role: 'practitioner',
  },

  // Herbalist users
  {
    firstName: 'Jennifer',
    lastName: 'Herbalist',
    email: 'jennifer.herbalist@example.com',
    role: 'herbalist',
  },
  {
    firstName: 'David',
    lastName: 'Botanist',
    email: 'david.botanist@example.com',
    role: 'herbalist',
  },

  // Regular users
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'user',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'user',
  },
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    role: 'user',
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    role: 'user',
  },
  {
    firstName: 'James',
    lastName: 'Williams',
    email: 'james.williams@example.com',
    role: 'user',
  },
  {
    firstName: 'Patricia',
    lastName: 'Brown',
    email: 'patricia.brown@example.com',
    role: 'user',
  },
]

/**
 * Generate user seed data
 */
export async function seedUsers(payload: Payload, count: number = 15): Promise<any[]> {
  log.info(`Generating ${count} user seed records...`)

  const users: any[] = []
  const usersToCreate = Math.min(count, USER_DATA.length)

  for (let i = 0; i < usersToCreate; i++) {
    const userData = USER_DATA[i]
    const birthYear = randomInt(1960, 2000)

    const user: any = {
      email: userData.email,
      password: 'Password123!', // Default password for all seed users
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phone: randomPhone(),
      dateOfBirth: new Date(`${birthYear}-${randomInt(1, 12)}-${randomInt(1, 28)}`).toISOString(),
      preferences: {
        language: randomItem(['en', 'es', 'zh-CN']),
        emailNotifications: randomItem([true, false]),
        theme: randomItem(['light', 'dark', 'system']),
      },
    }

    try {
      const created = await payload.create({
        collection: 'users',
        data: user,
      })

      users.push(created)
      log.progress(
        i + 1,
        usersToCreate,
        `${userData.firstName} ${userData.lastName} (${userData.role})`
      )
    } catch (error: any) {
      log.error(`Failed to create user ${userData.email}: ${error.message}`)
    }
  }

  log.success(`Created ${users.length}/${usersToCreate} users`)
  log.info('Default password for all users: Password123!')

  return users
}
