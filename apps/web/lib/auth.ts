import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor } from 'better-auth/plugins'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Better Auth Configuration
 *
 * Security Features:
 * - Email/password authentication with bcrypt
 * - OAuth (Google, GitHub)
 * - Multi-Factor Authentication (TOTP)
 * - Session management with HIPAA-compliant timeouts
 * - Rate limiting
 * - Email verification
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12, // HIPAA: Increased from default 8
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours (HIPAA: reduced from 7 days)
    updateAge: 60 * 60, // 1 hour (refresh session activity)
    // Note: For PHI access (symptom checker), implement additional
    // idle timeout of 15 minutes via client-side session monitoring
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      // HIPAA: Track MFA status for compliance
      mfaEnabled: {
        type: 'boolean',
        defaultValue: false,
      },
      mfaEnrolledAt: {
        type: 'date',
        required: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // 10 requests per window
  },
  // HIPAA: Multi-Factor Authentication
  // Recommended for all users, required for admin/PHI access
  plugins: [
    twoFactor({
      // TOTP (Time-based One-Time Password) - compatible with Google Authenticator, Authy, etc.
      issuer: 'Verscienta Health',
    }),
  ],
  // Advanced security options
  advanced: {
    // Generate secure session tokens
    generateId: () => crypto.randomUUID(),
    // Use secure cookies
    cookiePrefix: '__Secure-',
    // Cross-site request forgery protection
    crossSubDomainCookies: {
      enabled: false, // Disable for security unless needed
    },
  },
  // Trusted origins for CORS
  trustedOrigins: [
    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    'http://localhost:3000', // Development
  ],
})

export type Session = typeof auth.$Infer.Session
