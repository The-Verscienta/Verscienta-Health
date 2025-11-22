# API Versioning and CORS Configuration

**Status:** ✅ Complete
**Implemented:** January 20, 2025
**Version:** 1.0

## Overview

Verscienta Health implements comprehensive API versioning and CORS (Cross-Origin Resource Sharing) configuration to support:

- **Mobile applications** (iOS, Android via Capacitor/Ionic)
- **Third-party integrations** (partner APIs, external clients)
- **API evolution** (backward-compatible versioning)
- **Security** (controlled cross-origin access)

## Table of Contents

1. [API Versioning](#api-versioning)
2. [CORS Configuration](#cors-configuration)
3. [Implementation](#implementation)
4. [Usage Examples](#usage-examples)
5. [Testing](#testing)
6. [Migration Guide](#migration-guide)
7. [Troubleshooting](#troubleshooting)

---

## API Versioning

### Strategy

We use **URL-based versioning** with support for multiple version detection methods:

1. **URL Path** (recommended): `/api/v1/herbs`
2. **Header**: `X-Api-Version: 1`
3. **Query Parameter**: `/api/herbs?api_version=1`

### Current Version

- **Current:** v1
- **Supported:** [1]
- **Latest:** 1

### Version Lifecycle

```
v1 (Current)
  ↓
  Release v2
  ↓
v1 (Deprecated) ← 6 months deprecation notice
  |              X-Api-Deprecation: true
  |              X-Api-Sunset: 2025-12-01
  ↓
v1 (Sunset) ← After 12 months, removed
```

### Deprecation Policy

- **Deprecation Notice:** 6 months before sunset
- **Sunset Period:** 12 months after new version release
- **Headers:** Deprecated versions include deprecation warnings

### Version Headers

All API responses include versioning headers:

```http
X-Api-Version: 1
X-Api-Supported-Versions: 1
X-Api-Latest-Version: 1
X-Api-Deprecation: false
```

For deprecated versions:

```http
X-Api-Deprecation: true
X-Api-Deprecation-Date: 2025-06-01T00:00:00.000Z
X-Api-Sunset: 2025-12-01T00:00:00.000Z
Warning: 299 - "API version 1 is deprecated and will be removed on 2025-12-01T00:00:00.000Z"
```

---

## CORS Configuration

### Allowed Origins

**Automatic Origins (always allowed):**

1. **Web Application**
   - `NEXT_PUBLIC_APP_URL` (e.g., `https://verscienta.com`)
   - `NEXT_PUBLIC_WEB_URL`
   - `PAYLOAD_PUBLIC_SERVER_URL`

2. **Mobile Applications**
   - `capacitor://localhost` (Capacitor apps)
   - `ionic://localhost` (Ionic apps)
   - `verscienta-app://` (Custom app scheme)
   - `http://localhost` (iOS simulator)
   - `http://localhost:8100` (Ionic dev server)
   - `file://` (Mobile app file access)

3. **Development**
   - `http://localhost:*` (any port in development)

4. **Custom Origins**
   - Configured via `ALLOWED_CORS_ORIGINS` environment variable

### CORS Headers

Allowed origins receive these headers:

```http
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-App-Version
Access-Control-Max-Age: 86400
```

### Wildcard Patterns

Supports wildcard patterns for origins:

```env
ALLOWED_CORS_ORIGINS=https://*.verscienta.com,https://*.partner.com
```

---

## Implementation

### 1. Middleware (`apps/web/middleware.ts`)

Handles:
- API versioning (URL rewriting)
- CORS headers (all API routes)
- Preflight OPTIONS requests
- Version detection and validation

**Matcher:**
```typescript
export const config = {
  matcher: [
    '/api/:path*',
    '!/(payload)',
    '!/admin/(.*)',
  ],
}
```

### 2. Versioning Utilities (`lib/api-versioning.ts`)

Helper functions:

```typescript
// Get version from request
getApiVersion(request: NextRequest): ApiVersion

// Check if version is supported
isVersionSupported(version: number): boolean

// Create versioned response
versionedResponse(data, options): NextResponse

// Handle unsupported versions
unsupportedVersionResponse(version): NextResponse

// Route to version-specific handlers
versionedHandler(request, handlers): Promise<NextResponse>
```

### 3. Payload Configuration (`payload.config.ts`)

Enhanced CORS configuration for Payload Admin API:

```typescript
cors: [
  // Base web URLs
  process.env.NEXT_PUBLIC_SITE_URL,
  // Mobile app origins
  'capacitor://localhost',
  'ionic://localhost',
  'verscienta-app://',
  // Additional from env
  ...(process.env.ALLOWED_CORS_ORIGINS?.split(',') || []),
]
```

---

## Usage Examples

### Creating a Versioned API Route

```typescript
// app/api/mobile/herbs/route.ts
import { versionedHandler, versionedResponse } from '@/lib/api-versioning'
import { NextRequest } from 'next/server'

// V1 Handler
async function handleV1(request: NextRequest) {
  const data = await fetchDataV1()

  return versionedResponse(data, {
    version: 1,
    headers: {
      'Cache-Control': 'public, s-maxage=300',
    },
  })
}

// V2 Handler (future)
async function handleV2(request: NextRequest) {
  const data = await fetchDataV2()

  return versionedResponse(data, {
    version: 2,
    headers: {
      'Cache-Control': 'public, s-maxage=600',
    },
  })
}

// Main handler
export async function GET(request: NextRequest) {
  return versionedHandler(request, {
    1: handleV1,
    2: handleV2, // When v2 is ready
  })
}
```

### Client Usage

#### Mobile App (Capacitor)

```typescript
// Using URL versioning (recommended)
const response = await fetch('https://verscienta.com/api/v1/herbs')

// Using header
const response = await fetch('https://verscienta.com/api/herbs', {
  headers: {
    'X-Api-Version': '1',
  },
})

// Using query parameter
const response = await fetch('https://verscienta.com/api/herbs?api_version=1')
```

#### Web Application

```typescript
// Standard fetch (defaults to current version)
const response = await fetch('/api/herbs')

// Explicit version
const response = await fetch('/api/v1/herbs')
```

#### Third-Party Integration

```typescript
const response = await fetch('https://verscienta.com/api/v1/herbs', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-Api-Version': '1',
  },
})
```

---

## Testing

### Test CORS Configuration

```bash
# Test from allowed origin
curl -X OPTIONS https://verscienta.com/api/v1/herbs \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Expected headers:
# Access-Control-Allow-Origin: capacitor://localhost
# Access-Control-Allow-Credentials: true
```

### Test API Versioning

```bash
# Test v1 (current)
curl https://verscienta.com/api/v1/herbs -v

# Expected headers:
# X-Api-Version: 1
# X-Api-Latest-Version: 1
# X-Api-Deprecation: false

# Test v2 (not implemented)
curl https://verscienta.com/api/v2/herbs -v

# Expected: 501 Not Implemented
```

### Test Version Detection

```bash
# URL path
curl https://verscienta.com/api/v1/herbs

# Header
curl https://verscienta.com/api/herbs \
  -H "X-Api-Version: 1"

# Query parameter
curl "https://verscienta.com/api/herbs?api_version=1"

# All should return same response with X-Api-Version: 1
```

---

## Environment Configuration

### Required Variables

```env
# Base URLs (required)
NEXT_PUBLIC_APP_URL=https://verscienta.com
PAYLOAD_PUBLIC_SERVER_URL=https://verscienta.com
```

### Optional Variables

```env
# Additional CORS origins (comma-separated)
ALLOWED_CORS_ORIGINS=https://app.verscienta.com,https://*.partner.com

# Mobile app configuration
MOBILE_OFFLINE_MODE=false
MOBILE_PUSH_NOTIFICATIONS=false
```

### Example Configurations

**Development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
ALLOWED_CORS_ORIGINS=
```

**Production:**
```env
NEXT_PUBLIC_APP_URL=https://verscienta.com
PAYLOAD_PUBLIC_SERVER_URL=https://verscienta.com
ALLOWED_CORS_ORIGINS=https://app.verscienta.com,https://*.partner.com
```

**Mobile Development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_CORS_ORIGINS=http://localhost:8100,ionic://localhost
```

---

## Migration Guide

### Adding a New API Version (v2)

1. **Update Supported Versions**

```typescript
// lib/api-versioning.ts
export const CURRENT_API_VERSION: ApiVersion = 2
export const SUPPORTED_API_VERSIONS: ApiVersion[] = [1, 2]
```

2. **Create V2 Handler**

```typescript
// app/api/herbs/route.ts
async function handleV2(request: NextRequest) {
  // V2 implementation with new schema
  return versionedResponse(dataV2, { version: 2 })
}

export async function GET(request: NextRequest) {
  return versionedHandler(request, {
    1: handleV1,
    2: handleV2, // New version
  })
}
```

3. **Document Breaking Changes**

```typescript
// lib/api-versioning.ts
export const BREAKING_CHANGES: BreakingChange[] = [
  {
    version: 2,
    date: '2025-06-01',
    description: 'Renamed "title" field to "name" in herb schema',
    migration: 'Update client code: herb.title → herb.name',
  },
]
```

4. **Update Middleware** (if needed)

```typescript
// middleware.ts
if (versionNum === 2) {
  // V2-specific handling
}
```

### Deprecating Old Versions

1. **Mark as Deprecated**

```typescript
export const DEPRECATED_VERSIONS: ApiVersion[] = [1]
```

2. **Set Sunset Date**

Update `getSunsetDate()` to return actual date.

3. **Communicate to Clients**

- Email notifications
- API documentation
- Dashboard announcements

4. **Monitor Usage**

Log deprecated version usage:

```typescript
if (version === 1) {
  console.log('[DEPRECATED] Client using v1:', request.headers.get('user-agent'))
}
```

5. **Remove After Sunset**

```typescript
// Remove v1 handler
export async function GET(request: NextRequest) {
  return versionedHandler(request, {
    2: handleV2, // V1 removed
  })
}
```

---

## Troubleshooting

### CORS Issues

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**

1. Check origin is in allowed list:
   ```bash
   # Check Payload config
   cat apps/web/payload.config.ts | grep cors -A 10
   ```

2. Add to environment:
   ```env
   ALLOWED_CORS_ORIGINS=your-origin.com
   ```

3. Verify middleware is running:
   ```bash
   # Check middleware.ts matcher
   ```

### Version Not Found

**Problem:** `API version not supported`

**Solutions:**

1. Check requested version:
   ```bash
   curl https://verscienta.com/api/v1/herbs -v
   ```

2. Verify supported versions:
   ```bash
   # Check headers
   curl https://verscienta.com/api/herbs -v | grep X-Api-Supported-Versions
   ```

3. Update client to use supported version

### Middleware Not Applied

**Problem:** Versioning headers missing

**Solutions:**

1. Check Next.js config:
   ```typescript
   // next.config.ts - ensure middleware is enabled
   ```

2. Verify matcher pattern:
   ```typescript
   // middleware.ts
   export const config = {
     matcher: ['/api/:path*'],
   }
   ```

3. Restart dev server:
   ```bash
   pnpm dev
   ```

---

## Best Practices

### API Design

1. **Use Semantic Versioning**
   - Major version for breaking changes
   - Maintain backward compatibility within version

2. **Version Early**
   - Include `/v1/` from the start
   - Easier to add `/v2/` later

3. **Document Changes**
   - Maintain changelog
   - Document migration paths

### CORS Security

1. **Whitelist Origins**
   - Never use `Access-Control-Allow-Origin: *` with credentials
   - Explicitly list allowed origins

2. **Validate Origin**
   - Check origin against whitelist
   - Log unauthorized attempts

3. **Limit Headers**
   - Only allow necessary headers
   - Review `Access-Control-Allow-Headers` regularly

### Client Integration

1. **Always Specify Version**
   - Use `/api/v1/` in production
   - Don't rely on defaults

2. **Handle Deprecation**
   - Check `X-Api-Deprecation` header
   - Migrate before sunset

3. **Implement Retry Logic**
   - Handle 501 (version not supported)
   - Fallback to previous version if possible

---

## References

- [Payload CMS CORS Config](https://payloadcms.com/docs/configuration/overview#cors)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [HTTP Version Headers](https://tools.ietf.org/html/rfc7231#section-6.6.2)

---

## Support

For issues or questions:

- Check this documentation
- Review `apps/web/middleware.ts`
- Review `apps/web/lib/api-versioning.ts`
- Check environment variables in `.env.local`
- Test with curl commands above

---

**Last Updated:** January 20, 2025
**Maintained By:** Verscienta Engineering Team
