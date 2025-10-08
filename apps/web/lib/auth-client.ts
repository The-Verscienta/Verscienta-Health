'use client'

import { magicLinkClient, twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/**
 * Better Auth Client
 *
 * Provides client-side authentication methods including:
 * - Email/password authentication
 * - OAuth (Google, GitHub)
 * - Magic Link (passwordless email authentication)
 * - Two-factor authentication (TOTP)
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    magicLinkClient(), // Magic link authentication
    twoFactorClient(), // Two-factor authentication (TOTP)
  ],
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  // Magic link methods
  magicLink,
  // Two-factor methods
  twoFactor,
} = authClient
