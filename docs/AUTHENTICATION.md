# Authentication System Documentation

The Verscienta Health platform uses [better-auth](https://www.better-auth.com) for authentication with support for multiple authentication methods, two-factor authentication, and HIPAA-compliant security features.

## Table of Contents

- [Overview](#overview)
- [Authentication Methods](#authentication-methods)
- [Setup](#setup)
- [Configuration](#configuration)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Client Usage](#client-usage)
- [HIPAA Compliance](#hipaa-compliance)
- [Troubleshooting](#troubleshooting)

## Overview

The authentication system provides:

- **Email/Password Authentication** with strong password requirements
- **Magic Link Authentication** for passwordless sign-in
- **OAuth Providers** (Google, GitHub)
- **Two-Factor Authentication (2FA)** with TOTP
- **Passkey Support** (coming soon)
- **Session Management** with automatic refresh
- **Rate Limiting** to prevent abuse

## Authentication Methods

### 1. Email/Password Authentication

Traditional authentication with enhanced security requirements.

**Password Requirements (HIPAA-compliant):**
- Minimum 12 characters
- Maximum 128 characters
- Must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*(),.?":{}|<>)

**Example:**
```typescript
import { authClient } from '@/lib/auth-client'

// Sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe',
})

// Sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'SecurePassword123!',
})
```

### 2. Magic Link Authentication

Passwordless authentication via email link.

**Features:**
- 5-minute expiration
- One-time use only
- Automatic cleanup of expired links
- Responsive email template

**Example:**
```typescript
import { authClient } from '@/lib/auth-client'

// Request magic link
await authClient.magicLink.sendMagicLink({
  email: 'user@example.com',
})

// User clicks link in email, authentication handled automatically
```

**Email Template:**
The magic link email includes:
- Clear call-to-action button
- Fallback text link
- 5-minute expiration notice
- Security warning

### 3. OAuth Providers

Third-party authentication with Google and GitHub.

**Available Providers:**
- **Google** - Uses OAuth 2.0
- **GitHub** - Uses OAuth 2.0

**Example:**
```typescript
import { authClient } from '@/lib/auth-client'

// Sign in with Google
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
})

// Sign in with GitHub
await authClient.signIn.social({
  provider: 'github',
  callbackURL: '/dashboard',
})
```

**Environment Variables Required:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Two-Factor Authentication (2FA)

TOTP-based 2FA with backup codes.

**Setup Process:**
1. User requests 2FA setup
2. System generates TOTP secret and QR code
3. System generates 10 backup codes (8 characters each)
4. User scans QR code with authenticator app
5. User verifies TOTP code to enable 2FA

**Example:**
```typescript
// Server-side setup (apps/web/app/api/auth/mfa/setup/route.ts)
const response = await fetch('/api/auth/mfa/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
})

const { qrCode, secret, backupCodes } = await response.json()

// Display QR code and backup codes to user
// User scans QR code with Google Authenticator, Authy, etc.

// Verify and enable 2FA
await authClient.twoFactor.verify({
  code: '123456', // Code from authenticator app
})
```

**Backup Codes:**
- 10 codes generated at setup
- 8 characters each (hex format)
- Hashed with SHA-256 for storage
- One-time use only
- Used when TOTP device unavailable

## Setup

### Prerequisites

1. **PostgreSQL Database** - Better-auth uses Prisma with PostgreSQL
2. **Resend Account** - For magic link emails
3. **OAuth App Credentials** - For Google/GitHub authentication (optional)

### Installation

Better-auth is already installed. Dependencies:
```bash
pnpm add better-auth
pnpm add bcryptjs
pnpm add @prisma/client
```

### Database Schema

Better-auth automatically creates required tables via Prisma:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth and credential accounts
- `verification` - Email verification and magic links

Run migrations:
```bash
pnpm prisma migrate dev
```

### Environment Variables

Add to `.env`:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/verscienta

# App URL
NEXT_PUBLIC_APP_URL=https://app.verscientahealth.com
BETTER_AUTH_URL=https://app.verscientahealth.com

# Session Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# Email Service (for magic links)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Verscienta Health <noreply@verscientahealth.com>

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Configuration

### Server Configuration

Located in `apps/web/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink, twoFactor } from 'better-auth/plugins'
import { sendMagicLinkEmail } from './email'
import { prisma } from './prisma'

export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12, // HIPAA compliance
    maxPasswordLength: 128,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Refresh every 1 hour
  },

  // OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // Plugins
  plugins: [
    // Magic link authentication
    magicLink({
      expiresIn: 60 * 5, // 5 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url })
      },
    }),

    // Two-factor authentication
    twoFactor({
      issuer: 'Verscienta Health',
    }),
  ],

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
  },
})
```

### Client Configuration

Located in `apps/web/lib/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react'
import { magicLinkClient, twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  plugins: [
    magicLinkClient(),
    twoFactorClient(),
  ],
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  magicLink,
  twoFactor,
} = authClient
```

## Security Features

### 1. Session Management

**Configuration:**
- Sessions expire after 24 hours
- Auto-refresh every 1 hour
- Secure HTTP-only cookies
- CSRF protection enabled

**Session Data:**
```typescript
{
  user: {
    id: string
    email: string
    name: string
    image?: string
    emailVerified: boolean
  },
  session: {
    id: string
    userId: string
    expiresAt: Date
  }
}
```

### 2. Rate Limiting

**Global Limits:**
- 10 requests per minute per IP
- Configurable window and max requests

**Endpoint-Specific Limits:**
- Login: 5 attempts per 15 minutes
- Password reset: 3 requests per hour
- Magic link: 3 requests per 5 minutes

### 3. Password Security

**Hashing:**
- bcrypt with cost factor 10
- Automatic salt generation
- One-way hashing (passwords never decrypted)

**Password Changes:**
- Requires current password verification
- New password must differ from current
- All sessions remain active after change

### 4. Account Deletion

**Security Measures:**
- Password verification required (credential accounts)
- "DELETE" confirmation for OAuth accounts
- 30-day soft delete grace period
- All sessions immediately invalidated
- Email anonymization (`deleted_user@deleted.local`)
- Admin notification sent

### 5. Email Verification

**Process:**
1. User signs up with email/password
2. Verification email sent automatically
3. User clicks verification link
4. Account activated

**Verification Link:**
- 24-hour expiration
- One-time use only
- Automatic cleanup

## API Endpoints

### Authentication Endpoints

All endpoints are automatically created by better-auth:

#### Sign Up
```bash
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

#### Sign In
```bash
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Sign Out
```bash
POST /api/auth/sign-out
```

#### Get Session
```bash
GET /api/auth/session
```

#### Magic Link
```bash
POST /api/auth/magic-link/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 2FA Setup
```bash
POST /api/auth/two-factor/generate
```

#### 2FA Verify
```bash
POST /api/auth/two-factor/verify
Content-Type: application/json

{
  "code": "123456"
}
```

### Custom Endpoints

#### Profile Update
```bash
PUT /api/profile
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com"
}
```

#### Password Change
```bash
POST /api/settings/password
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Account Deletion
```bash
DELETE /api/settings/delete-account
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "password": "UserPassword123!"
}
```

## Client Usage

### React Hooks

#### useSession
```typescript
import { useSession } from '@/lib/auth-client'

function ProfilePage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  )
}
```

### Sign In/Out
```typescript
import { signIn, signOut } from '@/lib/auth-client'

// Email/Password Sign In
async function handleEmailSignIn(email: string, password: string) {
  const result = await signIn.email({
    email,
    password,
  })

  if (result.error) {
    console.error('Sign in error:', result.error)
  }
}

// OAuth Sign In
async function handleGoogleSignIn() {
  await signIn.social({
    provider: 'google',
    callbackURL: '/dashboard',
  })
}

// Sign Out
async function handleSignOut() {
  await signOut()
}
```

### Protected Routes

Using middleware (`apps/web/middleware.ts`):

```typescript
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Redirect to login if not authenticated
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

### Server Components

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return <div>Welcome, {session.user.name}</div>
}
```

### API Routes

```typescript
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle authenticated request
  return NextResponse.json({ userId: session.user.id })
}
```

## HIPAA Compliance

### Password Requirements

As required by HIPAA security standards:

- **Minimum Length**: 12 characters
- **Complexity**: Must contain uppercase, lowercase, numbers, and special characters
- **No Reuse**: Previous password cannot be reused
- **Secure Storage**: Hashed with bcrypt (cost factor 10)

### Session Security

- **Timeout**: 24-hour maximum session duration
- **Refresh**: Auto-refresh every 1 hour for active users
- **Invalidation**: All sessions invalidated on password change or account deletion
- **Secure Cookies**: HTTP-only, Secure flag in production

### Audit Logging

All authentication events are logged:

```typescript
console.log('Password changed successfully:', {
  userId: session.user.id,
  timestamp: new Date().toISOString(),
})

console.log('Account marked for deletion:', {
  userId: session.user.id,
  scheduledDeletion: deletionDate,
  timestamp: new Date().toISOString(),
})
```

### Data Privacy

- **Email Anonymization**: Deleted accounts have email changed to `deleted_<userId>@deleted.local`
- **Soft Delete**: 30-day grace period before permanent deletion
- **Right to Be Forgotten**: Account deletion process complies with privacy regulations

### Access Controls

- **Authentication Required**: All protected endpoints verify session
- **Authorization Checks**: User ID verification for profile operations
- **Password Verification**: Required for sensitive operations (password change, account deletion)

## Troubleshooting

### Common Issues

#### "Unauthorized" Error

**Symptom**: API returns 401 Unauthorized

**Solutions**:
1. Check session cookie is being sent
2. Verify `BETTER_AUTH_SECRET` is set
3. Check session hasn't expired (24-hour limit)
4. Ensure `getSession` is called with correct headers

```typescript
// Correct usage
const session = await auth.api.getSession({
  headers: request.headers, // Pass request headers
})
```

#### Magic Link Not Sending

**Symptom**: User doesn't receive magic link email

**Solutions**:
1. Check `RESEND_API_KEY` is configured
2. Verify sender domain is verified in Resend
3. Check spam folder
4. Review console logs for email errors

```bash
# Check if email service is configured
EMAIL_FROM=Verscienta Health <noreply@verscientahealth.com>
RESEND_API_KEY=re_your_key_here
```

#### OAuth Redirect Error

**Symptom**: OAuth login fails with redirect error

**Solutions**:
1. Verify callback URL in OAuth provider settings
2. Check `NEXT_PUBLIC_APP_URL` matches production URL
3. Ensure OAuth credentials are correct

```bash
# Google OAuth callback URL
https://app.verscientahealth.com/api/auth/callback/google

# GitHub OAuth callback URL
https://app.verscientahealth.com/api/auth/callback/github
```

#### 2FA Setup Fails

**Symptom**: QR code generation fails

**Solutions**:
1. Check database schema includes `twoFactorSecret` field
2. Verify user is authenticated
3. Run Prisma migrations

```bash
pnpm prisma migrate dev
```

#### Password Requirements Not Met

**Symptom**: "Password must be at least 12 characters" error

**Solution**: Ensure password meets all requirements:
- ✅ At least 12 characters
- ✅ Contains uppercase letter (A-Z)
- ✅ Contains lowercase letter (a-z)
- ✅ Contains number (0-9)
- ✅ Contains special character (!@#$%^&*(),.?":{}|<>)

Example valid password: `SecurePassword123!`

#### Session Not Persisting

**Symptom**: User logged out after page refresh

**Solutions**:
1. Check cookies are enabled in browser
2. Verify `Secure` flag is only set in production
3. Check `SameSite` cookie attribute
4. Ensure `BETTER_AUTH_SECRET` is consistent

### Debug Mode

Enable detailed logging:

```typescript
// apps/web/lib/auth.ts
export const auth = betterAuth({
  // ... other config
  logger: {
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
  },
})
```

### Testing Authentication

#### Test Magic Link Locally

```bash
# Use Resend test mode
RESEND_API_KEY=re_test_your_key

# Check console for magic link URL
# Email service not configured. Magic link URL: http://localhost:3000/auth/verify?token=...
```

#### Test OAuth Locally

Use localhost callback URLs in development:

```bash
# Google OAuth callback (development)
http://localhost:3000/api/auth/callback/google

# Update .env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Test 2FA

1. Use a 2FA app like Google Authenticator
2. Scan QR code in development
3. Use generated codes to test verification
4. Save backup codes for testing

## Resources

- [Better-auth Documentation](https://www.better-auth.com)
- [Better-auth Plugins](https://www.better-auth.com/docs/plugins)
- [Resend Documentation](https://resend.com/docs)
- [HIPAA Security Standards](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [TOTP RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)

## Migration Guide

### From Custom Auth to Better-auth

If migrating from a custom authentication system:

1. **Export user data** from old system
2. **Update database schema** to better-auth format
3. **Migrate user records** to new `user` table
4. **Hash passwords** if not already using bcrypt
5. **Test authentication** with existing accounts
6. **Update client code** to use better-auth hooks

### Password Migration

```typescript
// If migrating from different hash algorithm
import bcrypt from 'bcryptjs'

async function migratePassword(oldHash: string, newPassword: string) {
  // Hash with bcrypt
  const newHash = await bcrypt.hash(newPassword, 10)

  // Update in database
  await prisma.account.update({
    where: { /* ... */ },
    data: { password: newHash },
  })
}
```

## Security Best Practices

1. **Never log passwords** or sensitive tokens
2. **Use HTTPS** in production (automatic with Vercel/Netlify)
3. **Rotate secrets** regularly (BETTER_AUTH_SECRET, API keys)
4. **Monitor failed login attempts** for brute force attacks
5. **Implement rate limiting** on all auth endpoints (already configured)
6. **Use secure session cookies** (HTTP-only, Secure, SameSite)
7. **Validate all input** on both client and server
8. **Keep dependencies updated** for security patches
9. **Use CSP headers** to prevent XSS attacks
10. **Enable 2FA** for admin accounts
