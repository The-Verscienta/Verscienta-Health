import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthMiddleware } from 'better-auth/api'
import { magicLink, twoFactor } from 'better-auth/plugins'
import { accountLockout } from './account-lockout'
import { sendMagicLinkEmail, sendWelcomeEmail } from './email'
import { syncBetterAuthUserToPayload } from './payload-auth-sync'
import { prisma } from './prisma'
import { securityMonitor } from './security-monitor'
import { sessionLogger } from './session-logger'

/**
 * Better Auth Configuration
 *
 * Security Features:
 * - Email/password authentication with bcrypt
 * - OAuth (Google, GitHub)
 * - Magic Link (passwordless email authentication)
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
  // HIPAA: Multi-Factor Authentication & Passwordless Authentication
  // Recommended for all users, required for admin/PHI access
  plugins: [
    // Magic Link - passwordless email authentication
    // Users receive a one-time link via email to sign in
    magicLink({
      // Link expires after 5 minutes
      expiresIn: 60 * 5,
      // Send magic link via email
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url })
      },
    }),
    // TOTP-based 2FA (Time-based One-Time Password)
    // Compatible with Google Authenticator, Authy, etc.
    twoFactor({
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
  // HIPAA: Session activity logging for compliance and security
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Check if account is locked before allowing login
      if (ctx.path === '/sign-in/email' && ctx.method === 'POST') {
        try {
          const email = ctx.body?.email

          if (email) {
            const { allowed, reason } = await accountLockout.canAttemptLogin(email)

            if (!allowed) {
              console.warn(`[Account Security] Login blocked for locked account: ${email}`)
              throw new Error(reason || 'Account is locked')
            }
          }
        } catch (error) {
          console.error('[Account Security] Lockout check error:', error)
          throw error
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      try {
        // Extract session and user from context
        const contextData = ctx.context as any
        const session = contextData?.session
        const user = contextData?.user
        const ipAddress = ctx.headers?.get('x-forwarded-for') || undefined
        const userAgent = ctx.headers?.get('user-agent') || undefined

        // Handle successful email sign-ins
        if (ctx.path === '/sign-in/email' && ctx.method === 'POST' && session && user) {
          try {
            // Clear failed login attempts
            await accountLockout.recordSuccess(user.email)

            // Track session for security monitoring
            await securityMonitor.trackSession({
              userId: user.id,
              sessionId: session.id || session.token || 'unknown',
              ipAddress,
              userAgent,
              deviceId: undefined,
            })

            // Detect unusual login patterns
            await securityMonitor.detectUnusualLoginPattern({
              userId: user.id,
              userEmail: user.email,
              timestamp: new Date(),
              ipAddress,
            })

            // Log successful login
            await sessionLogger.loginSuccess({
              sessionId: session.id || session.token || 'unknown',
              userId: user.id,
              userEmail: user.email,
              ipAddress,
              userAgent,
              provider: 'email',
            })

            // Log session start
            await sessionLogger.sessionStart({
              sessionId: session.id || session.token || 'unknown',
              userId: user.id,
              userEmail: user.email,
              ipAddress,
              userAgent,
              expiresAt: session.expiresAt
                ? new Date(session.expiresAt)
                : new Date(Date.now() + 60 * 60 * 24 * 1000),
            })

            // Sync user to Payload CMS
            await syncBetterAuthUserToPayload({
              id: user.id,
              email: user.email,
              firstName: (user as any).firstName,
              lastName: (user as any).lastName,
              role: (user as any).role,
              emailVerified: user.emailVerified,
            })
          } catch (error) {
            console.error('[Session] Logging error (sign-in):', error)
          }
        }

        // Handle successful sign-ups (new user registration)
        if (ctx.path === '/sign-up/email' && ctx.method === 'POST' && session && user) {
          try {
            // Send welcome email to new user
            await sendWelcomeEmail({
              email: user.email,
              firstName: (user as any).firstName,
            })

            console.log(`[Auth] Welcome email sent to new user: ${user.email}`)
          } catch (error) {
            // Don't fail registration if email fails
            console.error('[Auth] Failed to send welcome email:', error)
          }
        }

        // Handle failed email sign-ins (when no session/user but path matched)
        if (ctx.path === '/sign-in/email' && ctx.method === 'POST' && (!session || !user)) {
          try {
            const email = ctx.body?.email || 'unknown'

            if (email !== 'unknown') {
              await accountLockout.recordFailure(email, { ipAddress, userAgent })
            }

            await sessionLogger.loginFailure({
              sessionId: 'failed-' + Date.now(),
              userEmail: email,
              ipAddress,
              userAgent,
              reason: 'Invalid credentials or unverified email',
            })
          } catch (error) {
            console.error('[Session] Logging error (failed sign-in):', error)
          }
        }

        // Handle OAuth sign-ins
        if (
          (ctx.path === '/sign-in/social' || ctx.path?.includes('/callback/')) &&
          session &&
          user
        ) {
          try {
            const provider = ctx.path?.includes('google')
              ? 'google'
              : ('github' as 'google' | 'github')

            await sessionLogger.oauthSuccess({
              sessionId: session.id || session.token || 'unknown',
              userId: user.id,
              userEmail: user.email,
              provider,
            })

            // Sync user to Payload CMS
            await syncBetterAuthUserToPayload({
              id: user.id,
              email: user.email,
              firstName: (user as any).firstName,
              lastName: (user as any).lastName,
              role: (user as any).role,
              emailVerified: user.emailVerified,
            })
          } catch (error) {
            console.error('[Session] Logging error (OAuth):', error)
          }
        }

        // Handle magic link sign-ins
        if (ctx.path === '/magic-link/verify' && session && user) {
          try {
            await sessionLogger.magicLinkClicked({
              sessionId: session.id || session.token || 'unknown',
              userId: user.id,
              userEmail: user.email,
            })

            // Sync user to Payload CMS
            await syncBetterAuthUserToPayload({
              id: user.id,
              email: user.email,
              firstName: (user as any).firstName,
              lastName: (user as any).lastName,
              role: (user as any).role,
              emailVerified: user.emailVerified,
            })
          } catch (error) {
            console.error('[Session] Logging error (magic link):', error)
          }
        }

        // Handle sign-outs
        if (ctx.path === '/sign-out' && ctx.method === 'POST' && session && user) {
          try {
            await securityMonitor.removeSession(session.id || session.token || 'unknown', user.id)

            await sessionLogger.logout({
              sessionId: session.id || session.token || 'unknown',
              userId: user.id,
              manual: true,
            })
          } catch (error) {
            console.error('[Session] Logging error (sign-out):', error)
          }
        }

        // Handle MFA verification
        if (ctx.path === '/two-factor/verify' && ctx.method === 'POST') {
          try {
            if (session && user) {
              await sessionLogger.mfaSuccess({
                sessionId: session.id || session.token || 'unknown',
                userId: user.id,
              })
            } else {
              // MFA verification failed (no session/user)
              await sessionLogger.mfaFailure({
                sessionId: 'failed-mfa-' + Date.now(),
                userId: user?.id || 'unknown',
              })
            }
          } catch (error) {
            console.error('[Session] Logging error (MFA):', error)
          }
        }
      } catch (error) {
        // Don't fail the request if logging fails
        console.error('[Session] Hook error:', error)
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
