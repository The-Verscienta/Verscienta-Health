import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink, twoFactor } from 'better-auth/plugins'
// import { createAuthMiddleware } from 'better-auth/api'
import { sendMagicLinkEmail } from './email'
import { prisma } from './prisma'
// import { sessionLogger } from './session-logger'
// import { accountLockout } from './account-lockout'
// import { securityMonitor } from './security-monitor'

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
      if (ctx.path === '/sign-in/email') {
        try {
          const email = ctx.body?.email

          if (email) {
            const { allowed, reason } = await accountLockout.canAttemptLogin(email)

            if (!allowed) {
              console.warn(`[Account Security] Login blocked for locked account: ${email}`)

              // Throw error to block login
              throw new Error(reason || 'Account is locked')
            }
          }
        } catch (error) {
          console.error('Account lockout check error:', error)
          // Re-throw to block login
          throw error
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      try {
        // Log successful email sign-ins, clear account lockout & track session security
        if (ctx.path === '/sign-in/email') {
          try {
            // Only log successful sign-ins (response is ok)
            if (context.response && context.responseStatus === 200) {
              const body = await context.request?.json().catch(() => ({}))
              const session = context.context.session
              const user = context.context.user
              const ipAddress = context.request?.headers.get('x-forwarded-for') || undefined
              const userAgent = context.request?.headers.get('user-agent') || undefined

              if (session && user) {
                // Clear failed login attempts on successful login
                await accountLockout.recordSuccess(user.email)

                // Track session for security monitoring
                await securityMonitor.trackSession({
                  userId: user.id,
                  sessionId: session.id || session.token || 'unknown',
                  ipAddress,
                  userAgent,
                  deviceId: undefined, // TODO: Add device fingerprinting
                })

                // Detect unusual login patterns
                await securityMonitor.detectUnusualLoginPattern({
                  userId: user.id,
                  userEmail: user.email,
                  timestamp: new Date(),
                  ipAddress,
                })

                await sessionLogger.loginSuccess({
                  sessionId: session.id || session.token || 'unknown',
                  userId: user.id,
                  userEmail: user.email,
                  ipAddress,
                  userAgent,
                  provider: 'email',
                })

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
              }
            }
          } catch (error) {
            // Don't fail the request if logging fails
            console.error('Session logging error (sign-in):', error)
          }
        },
      },
      {
        // Log failed sign-ins & record for account lockout
        matcher: (context) => context.path === '/sign-in/email' && context.method === 'POST',
        handler: async (context) => {
          try {
            // Log failed sign-ins (response is not ok)
            if (context.response && context.responseStatus !== 200) {
              const body = await context.request?.json().catch(() => ({}))
              const email = (body as any)?.email || 'unknown'
              const ipAddress = context.request?.headers.get('x-forwarded-for') || undefined
              const userAgent = context.request?.headers.get('user-agent') || undefined

              // Record failed attempt for account lockout
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
            }
          } catch (error) {
            console.error('Session logging error (failed sign-in):', error)
          }
        },
      },
      {
        // Log OAuth sign-ins
        matcher: (context) =>
          (context.path === '/sign-in/social' || context.path?.includes('/callback/')) &&
          context.method === 'GET',
        handler: async (context) => {
          try {
            if (context.response && context.responseStatus === 200) {
              const session = context.context.session
              const user = context.context.user

              if (session && user) {
                const provider =
                  context.path?.includes('google') ? 'google' : ('github' as 'google' | 'github')

                await sessionLogger.oauthSuccess({
                  sessionId: session.id || session.token || 'unknown',
                  userId: user.id,
                  userEmail: user.email,
                  provider,
                })
              }
            }
          } catch (error) {
            console.error('Session logging error (OAuth):', error)
          }
        },
      },
      {
        // Log magic link sign-ins
        matcher: (context) => context.path === '/magic-link/verify' && context.method === 'GET',
        handler: async (context) => {
          try {
            if (context.response && context.responseStatus === 200) {
              const session = context.context.session
              const user = context.context.user

              if (session && user) {
                await sessionLogger.magicLinkClicked({
                  sessionId: session.id || session.token || 'unknown',
                  userId: user.id,
                  userEmail: user.email,
                })
              }
            }
          } catch (error) {
            console.error('Session logging error (magic link):', error)
          }
        },
      },
      {
        // Log sign-outs & remove session from security monitoring
        matcher: (context) => context.path === '/sign-out' && context.method === 'POST',
        handler: async (context) => {
          try {
            // Get session before it's destroyed
            const session = context.context.session
            const user = context.context.user

            if (session && user) {
              // Remove session from security monitoring
              await securityMonitor.removeSession(
                session.id || session.token || 'unknown',
                user.id
              )

              await sessionLogger.logout({
                sessionId: session.id || session.token || 'unknown',
                userId: user.id,
                manual: true,
              })
            }
          } catch (error) {
            console.error('Session logging error (sign-out):', error)
          }
        },
      },
      {
        // Log MFA verification success
        matcher: (context) =>
          context.path === '/two-factor/verify' && context.method === 'POST',
        handler: async (context) => {
          try {
            if (context.response && context.responseStatus === 200) {
              const session = context.context.session
              const user = context.context.user

              if (session && user) {
                await sessionLogger.mfaSuccess({
                  sessionId: session.id || session.token || 'unknown',
                  userId: user.id,
                })
              }
            }
          } catch (error) {
            console.error('Session logging error (MFA success):', error)
          }
        },
      },
      {
        // Log MFA verification failure
        matcher: (context) =>
          context.path === '/two-factor/verify' && context.method === 'POST',
        handler: async (context) => {
          try {
            if (context.response && context.responseStatus !== 200) {
              const session = context.context.session
              const user = context.context.user

              if (session && user) {
                await sessionLogger.mfaFailure({
                  sessionId: session.id || session.token || 'unknown',
                  userId: user.id,
                })
              }
            }
          } catch (error) {
            console.error('Session logging error (MFA failure):', error)
          }
        },
      },
    ],
  },
})

export type Session = typeof auth.$Infer.Session
