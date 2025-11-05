/**
 * Payload-Better Auth User Sync
 *
 * Synchronizes users between Better Auth (authentication) and Payload CMS (content management).
 * Better Auth manages authentication, sessions, and security.
 * Payload manages user profiles and content access control.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get or create a Payload user for a Better Auth user
 * Called after successful Better Auth sign-in
 */
export async function syncBetterAuthUserToPayload(betterAuthUser: {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  role?: string
  emailVerified?: boolean
}) {
  try {
    const payload = await getPayload({ config })

    // Check if Payload user already exists with this betterAuthId
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        betterAuthId: {
          equals: betterAuthUser.id,
        },
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      // User exists, update their info
      const payloadUser = existingUsers.docs[0]

      await payload.update({
        collection: 'users',
        id: payloadUser.id,
        data: {
          email: betterAuthUser.email,
          firstName: betterAuthUser.firstName || payloadUser.firstName,
          lastName: betterAuthUser.lastName || payloadUser.lastName,
          role: betterAuthUser.role || payloadUser.role,
        },
      })

      console.log(`✅ Synced Better Auth user to Payload: ${betterAuthUser.email}`)
      return payloadUser.id
    } else {
      // Check if a user with this email already exists (migration case)
      const usersByEmail = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: betterAuthUser.email,
          },
        },
        limit: 1,
      })

      if (usersByEmail.docs.length > 0) {
        // User exists by email, link them to Better Auth
        const payloadUser = usersByEmail.docs[0]

        await payload.update({
          collection: 'users',
          id: payloadUser.id,
          data: {
            betterAuthId: betterAuthUser.id,
            firstName: betterAuthUser.firstName || payloadUser.firstName,
            lastName: betterAuthUser.lastName || payloadUser.lastName,
            role: betterAuthUser.role || payloadUser.role,
          },
        })

        console.log(`✅ Linked existing Payload user to Better Auth: ${betterAuthUser.email}`)
        return payloadUser.id
      } else {
        // Create new Payload user
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: betterAuthUser.email,
            firstName: betterAuthUser.firstName || '',
            lastName: betterAuthUser.lastName || '',
            role: betterAuthUser.role || 'user',
            betterAuthId: betterAuthUser.id,
            // Payload requires a password field, but we're using Better Auth for authentication
            // Generate a random password that won't be used
            password: crypto.randomUUID() + crypto.randomUUID(),
          },
        })

        console.log(`✅ Created Payload user from Better Auth: ${betterAuthUser.email}`)
        return newUser.id
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync Better Auth user to Payload:', error)
    // Don't throw - authentication should succeed even if Payload sync fails
    return null
  }
}

/**
 * Get Payload user by Better Auth ID
 */
export async function getPayloadUserByBetterAuthId(betterAuthId: string) {
  try {
    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: {
        betterAuthId: {
          equals: betterAuthId,
        },
      },
      limit: 1,
    })

    return users.docs[0] || null
  } catch (error) {
    console.error('❌ Failed to get Payload user by Better Auth ID:', error)
    return null
  }
}

/**
 * Update Payload user role
 */
export async function updatePayloadUserRole(
  betterAuthId: string,
  role: 'admin' | 'editor' | 'practitioner' | 'herbalist' | 'user'
) {
  try {
    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: {
        betterAuthId: {
          equals: betterAuthId,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      console.error('❌ Payload user not found for Better Auth ID:', betterAuthId)
      return false
    }

    const payloadUser = users.docs[0]

    await payload.update({
      collection: 'users',
      id: payloadUser.id,
      data: {
        role,
      },
    })

    console.log(`✅ Updated Payload user role: ${payloadUser.email} -> ${role}`)
    return true
  } catch (error) {
    console.error('❌ Failed to update Payload user role:', error)
    return false
  }
}

/**
 * Delete Payload user when Better Auth user is deleted
 */
export async function deletePayloadUser(betterAuthId: string) {
  try {
    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: {
        betterAuthId: {
          equals: betterAuthId,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      console.warn('⚠️ Payload user not found for deletion:', betterAuthId)
      return false
    }

    const payloadUser = users.docs[0]

    await payload.delete({
      collection: 'users',
      id: payloadUser.id,
    })

    console.log(`✅ Deleted Payload user: ${payloadUser.email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to delete Payload user:', error)
    return false
  }
}
