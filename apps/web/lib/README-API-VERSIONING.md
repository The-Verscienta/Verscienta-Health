# API Versioning Quick Reference

Quick reference for using the API versioning utilities.

## Import

```typescript
import {
  versionedHandler,
  versionedResponse,
  getApiVersion,
  unsupportedVersionResponse,
} from '@/lib/api-versioning'
```

## Basic Usage

### Simple Versioned Route

```typescript
import { NextRequest } from 'next/server'
import { versionedResponse } from '@/lib/api-versioning'

export async function GET(request: NextRequest) {
  const data = await fetchData()

  return versionedResponse(data, {
    version: 1,
    headers: {
      'Cache-Control': 'public, s-maxage=300',
    },
  })
}
```

### Multiple Versions

```typescript
import { versionedHandler } from '@/lib/api-versioning'

async function handleV1(request: NextRequest) {
  const data = await fetchDataV1()
  return versionedResponse(data, { version: 1 })
}

async function handleV2(request: NextRequest) {
  const data = await fetchDataV2()
  return versionedResponse(data, { version: 2 })
}

export async function GET(request: NextRequest) {
  return versionedHandler(request, {
    1: handleV1,
    2: handleV2,
  })
}
```

## Client Usage

### Web Application

```typescript
// Use versioned path (recommended)
const response = await fetch('/api/v1/herbs')

// Or use header
const response = await fetch('/api/herbs', {
  headers: {
    'X-Api-Version': '1',
  },
})
```

### Mobile App (Capacitor)

```typescript
// Automatic CORS support
const response = await fetch('https://verscienta.com/api/v1/mobile/herbs')

// Check version support
const version = response.headers.get('X-Api-Version')
const supported = response.headers.get('X-Api-Supported-Versions')
```

### Third-Party Integration

```typescript
const response = await fetch('https://verscienta.com/api/v1/herbs', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-Api-Version': '1',
  },
})
```

## Version Detection

The middleware checks for version in this order:

1. **URL path**: `/api/v1/herbs` → version 1
2. **Header**: `X-Api-Version: 1` → version 1
3. **Query param**: `?api_version=1` → version 1
4. **Default**: current version (1)

## Response Headers

All API responses include:

```http
X-Api-Version: 1
X-Api-Supported-Versions: 1, 2
X-Api-Latest-Version: 2
X-Api-Deprecation: false
```

## Deprecation

When a version is deprecated:

```http
X-Api-Deprecation: true
X-Api-Deprecation-Date: 2025-06-01T00:00:00.000Z
X-Api-Sunset: 2025-12-01T00:00:00.000Z
Warning: 299 - "API version 1 is deprecated..."
```

## CORS

### Allowed Origins

Automatically allowed:
- Web URLs (`NEXT_PUBLIC_APP_URL`)
- Mobile apps (`capacitor://localhost`)
- Development (`http://localhost:*`)
- Custom origins (`ALLOWED_CORS_ORIGINS`)

### Adding Origins

```env
# .env.local
ALLOWED_CORS_ORIGINS=https://app.verscienta.com,https://*.partner.com
```

### Testing CORS

```bash
curl -X OPTIONS https://verscienta.com/api/v1/herbs \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

## Constants

```typescript
import {
  CURRENT_API_VERSION,      // 1
  SUPPORTED_API_VERSIONS,   // [1]
} from '@/lib/api-versioning'
```

## Error Handling

### Unsupported Version

```typescript
// Automatically handled by versionedHandler
// Returns 400 with error message
{
  "error": "Unsupported API version",
  "requestedVersion": 3,
  "supportedVersions": [1, 2],
  "latestVersion": 2
}
```

### Invalid Version

```typescript
// Version < 1
// Returns 400
{
  "error": "Invalid API version",
  "message": "API version must be >= 1"
}
```

### Not Implemented

```typescript
// Future version requested
// Returns 501
{
  "error": "API version not supported",
  "version": 2,
  "message": "API version 2 is not yet implemented",
  "supportedVersions": [1]
}
```

## Best Practices

1. **Always use versioned paths** in production
2. **Check deprecation headers** in client code
3. **Migrate before sunset** (12-month window)
4. **Test with multiple versions** during development
5. **Document breaking changes** in BREAKING_CHANGES array

## Full Documentation

See: `docs/API_VERSIONING_AND_CORS.md`

## Test Suite

```bash
./scripts/test-api-versioning.sh
```
