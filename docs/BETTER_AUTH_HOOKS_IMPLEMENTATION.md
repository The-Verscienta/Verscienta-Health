# Better Auth Hooks Implementation Guide

**Created**: 2025-10-20
**Status**: Documented - Ready for Implementation
**Better-Auth Version**: v1.3.26
**Related File**: `apps/web/lib/auth.ts`

---

## Overview

This document provides step-by-step instructions for implementing better-auth v1.3.26 hooks for session logging, account lockout, and security monitoring in Verscienta Health.

**Current Status**: Hooks are currently commented out in `apps/web/lib/auth.ts` due to API incompatibility with the old hooks format.

**Goal**: Refactor hooks to use the correct `createAuthMiddleware` API from better-auth v1.3.26.

---

## Correct Hooks API Format (v1.3.26)

Better-auth v1.3.26 uses `createAuthMiddleware` to create hooks, NOT arrays of objects with `matcher` and `handler`.

### Correct Format

```typescript
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Your before logic here
      // ctx.path - current endpoint path
      // ctx.body - parsed request body
      // ctx.headers - request headers
      // ctx.query - query parameters
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Your after logic here
      // ctx.context - auth-related context (session, user, etc.)
    })
  },
})
```

---

## Step 1: Uncomment Imports

**File**: `apps/web/lib/auth.ts`

Uncomment the following imports at the top of the file:

```typescript
import { createAuthMiddleware } from 'better-auth/api'
import { sessionLogger } from './session-logger'
import { accountLockout } from './account-lockout'
import { securityMonitor } from './security-monitor'
```

**Current (lines 4-9)**:
```typescript
// import { createAuthMiddleware } from 'better-auth/api'
import { sendMagicLinkEmail } from './email'
import { prisma } from './prisma'
// import { sessionLogger } from './session-logger'
// import { accountLockout } from './account-lockout'
// import { securityMonitor } from './security-monitor'
```

**After**:
```typescript
import { createAuthMiddleware } from 'better-auth/api'
import { sendMagicLinkEmail } from './email'
import { prisma } from './prisma'
import { sessionLogger } from './session-logger'
import { accountLockout } from './account-lockout'
import { securityMonitor } from './security-monitor'
```

---

## Step 2: Implement Before Hook (Account Lockout)

The before hook should check if an account is locked before allowing login.

**Add to `betterAuth()` configuration (after `trustedOrigins`)**:

```typescript
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
            throw new Error(reason || 'Account is locked')
          }
        }
      } catch (error) {
        console.error('Account lockout check error:', error)
        throw error // Re-throw to block login
      }
    }
  }),
}
```

**How it works**:
- Runs before `/sign-in/email` endpoint processes the request
- Checks if email is locked via `accountLockout.canAttemptLogin()`
- Throws error to block login if account is locked
- Logs warning for security monitoring

---

## Step 3: Implement After Hook (Session Logging)

The after hook should log authentication events and track security metrics.

**Add to `hooks` object (after `before`)**:

```typescript
after: createAuthMiddleware(async (ctx) => {
  try {
    const session = ctx.context?.session
    const user = ctx.context?.user
    const request = ctx.request
    const ipAddress = request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || undefined
    const userAgent = request?.headers?.get('user-agent') || undefined

    // 1. Handle Email Sign-In Success
    if (ctx.path === '/sign-in/email' && session && user) {
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
    }

    // 2. Handle Email Sign-In Failure
    if (ctx.path === '/sign-in/email' && !session) {
      const email = ctx.body?.email || 'unknown'

      // Record failed attempt for account lockout
      if (email !== 'unknown') {
        await accountLockout.recordFailure(email, { ipAddress, userAgent })
      }

      // Log failed login
      await sessionLogger.loginFailure({
        sessionId: 'failed-' + Date.now(),
        userEmail: email,
        ipAddress,
        userAgent,
        reason: 'Invalid credentials or unverified email',
      })
    }

    // 3. Handle OAuth Sign-In
    if ((ctx.path === '/sign-in/social' || ctx.path?.includes('/callback/')) && session && user) {
      const provider = ctx.path?.includes('google') ? 'google' : 'github'

      await sessionLogger.oauthSuccess({
        sessionId: session.id || session.token || 'unknown',
        userId: user.id,
        userEmail: user.email,
        provider: provider as 'google' | 'github',
      })
    }

    // 4. Handle Magic Link Sign-In
    if (ctx.path === '/magic-link/verify' && session && user) {
      await sessionLogger.magicLinkClicked({
        sessionId: session.id || session.token || 'unknown',
        userId: user.id,
        userEmail: user.email,
      })
    }

    // 5. Handle Sign-Out
    if (ctx.path === '/sign-out' && session && user) {
      // Remove session from security monitoring
      await securityMonitor.removeSession(
        session.id || session.token || 'unknown',
        user.id
      )

      // Log logout
      await sessionLogger.logout({
        sessionId: session.id || session.token || 'unknown',
        userId: user.id,
        manual: true,
      })
    }

    // 6. Handle MFA Verification Success
    if (ctx.path === '/two-factor/verify' && session && user) {
      await sessionLogger.mfaSuccess({
        sessionId: session.id || session.token || 'unknown',
        userId: user.id,
      })
    }

    // 7. Handle MFA Verification Failure
    if (ctx.path === '/two-factor/verify' && !session) {
      // Get user from context even if session failed
      const userId = ctx.context?.user?.id || 'unknown'

      await sessionLogger.mfaFailure({
        sessionId: 'mfa-failed-' + Date.now(),
        userId,
      })
    }
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Session logging error:', error)
  }
}),
```

**How it works**:
- Runs after authentication endpoints process requests
- Logs all authentication events (login, logout, MFA, OAuth, magic link)
- Records successful logins to clear account lockout counters
- Records failed logins to increment account lockout counters
- Tracks security metrics (unusual login patterns, IP addresses)
- Errors in logging don't fail the auth request

---

## Step 4: Remove Old Commented Hooks

**Delete** the entire commented-out hooks section (currently lines ~115-367 in `auth.ts`).

**Look for**:
```typescript
// HIPAA: Session activity logging for compliance and security
// TODO: Add hooks after verifying better-auth v1.3.26 hooks API
/*
hooks: {
  before: [
    ...
  ],
  after: [
    ...
  ],
},
*/
```

**Replace with** the new hooks implementation from Steps 2-3.

---

## Step 5: Verify TypeScript Compilation

Run TypeScript to ensure no type errors:

```bash
cd apps/web
pnpm tsc --noEmit
```

**Expected**: No errors related to `auth.ts`

**Common Issues**:
- **`context` undefined**: Use `ctx.context` (context is nested)
- **`request` undefined**: Use `ctx.request`
- **Missing imports**: Ensure all imports are uncommented
- **Type errors**: Add type assertions if needed: `ctx.body as { email?: string }`

---

## Step 6: Test Hooks Functionality

### Test Account Lockout

1. **Start dev server**:
   ```bash
   pnpm dev:web
   ```

2. **Attempt failed logins** (5+ times with wrong password):
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"wrongpassword"}'
   ```

3. **Verify account locked**:
   - After 5 failed attempts, next login should be blocked
   - Check logs for: `[Account Security] Login blocked for locked account`

4. **Verify lockout clears on success**:
   - Wait for lockout period to expire
   - Login with correct password
   - Verify account is unlocked for future attempts

### Test Session Logging

1. **Successful login**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"correctpassword"}'
   ```

2. **Check logs** (console output):
   - `loginSuccess` event logged
   - `sessionStart` event logged
   - IP address and user agent captured

3. **Check database** (`Session` table):
   - New session record created
   - `ipAddress` field populated
   - `userAgent` field populated

### Test Security Monitoring

1. **Login from unusual IP**:
   - Use VPN or different network
   - Login to existing account
   - Check for unusual login pattern detection

2. **Concurrent sessions**:
   - Login from multiple devices
   - Verify all sessions tracked in `securityMonitor`

---

## Step 7: Deploy to Production

Once hooks are tested in development:

1. **Commit changes**:
   ```bash
   git add apps/web/lib/auth.ts
   git commit -m "feat: implement better-auth v1.3.26 hooks for session logging and account lockout"
   ```

2. **Deploy to production**:
   - Follow standard deployment process
   - Monitor logs for any hook errors
   - Verify session logging works in production

3. **Monitor hook performance**:
   - Check for any performance degradation
   - Ensure logs are being written to database
   - Verify account lockout works as expected

---

## Troubleshooting

### Issue: Hooks not running

**Symptoms**: No log output, account lockout not working

**Solutions**:
- Verify imports are uncommented
- Check that hooks are added to `betterAuth()` config
- Restart dev server after changes
- Check for TypeScript errors: `pnpm tsc --noEmit`

### Issue: Type errors with `ctx.context`

**Symptoms**: TypeScript errors about undefined properties

**Solutions**:
- Add optional chaining: `ctx.context?.session`
- Add type guards: `if (ctx.context && ctx.context.session)`
- Check better-auth version: `grep "better-auth" apps/web/package.json`

### Issue: Account lockout too aggressive

**Symptoms**: Users getting locked out too quickly

**Solutions**:
- Adjust `maxAttempts` in `apps/web/lib/account-lockout.ts`
- Increase lockout duration
- Add whitelist for trusted IPs

### Issue: Session logs not appearing

**Symptoms**: Database `Session` table not updating

**Solutions**:
- Check Prisma client is generated: `pnpm prisma generate`
- Verify database connection: `pnpm prisma db push`
- Check `session-logger.ts` implementation
- Ensure hooks are not silently failing (check console for errors)

---

## Related Files

| File | Purpose |
|------|---------|
| `apps/web/lib/auth.ts` | Main better-auth configuration |
| `apps/web/lib/session-logger.ts` | Session event logging |
| `apps/web/lib/account-lockout.ts` | Account lockout logic |
| `apps/web/lib/security-monitor.ts` | Security monitoring |
| `apps/web/prisma/schema.prisma` | Database schema with indexes |
| `docs/DATABASE_INDEXES.md` | Database index documentation |

---

## Security Benefits

Once implemented, these hooks provide:

✅ **HIPAA Compliance**: Complete audit trail of all authentication events
✅ **Brute Force Protection**: Account lockout after failed login attempts
✅ **Threat Detection**: Unusual login pattern detection (IP, time, geolocation)
✅ **Session Management**: Full session lifecycle tracking
✅ **Incident Response**: Detailed logs for security investigations

---

## Next Steps

1. [ ] Implement hooks following Steps 1-4
2. [ ] Test hooks following Step 6
3. [ ] Deploy to staging environment
4. [ ] Monitor performance and logs
5. [ ] Deploy to production
6. [ ] Update TODO_MASTER.md to mark task complete

---

**Questions or Issues?** Contact the development team or create an issue in the repository.
