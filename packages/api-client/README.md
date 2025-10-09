# @verscienta/api-client

Type-safe API client for Verscienta Health platform.

## Purpose

Platform-agnostic TypeScript API client that works with:
- React / Next.js (web)
- React Native (iOS, Android)
- Expo
- Can be adapted for Flutter via TypeScript bridge

## Installation

Within the monorepo:

```bash
pnpm add @verscienta/api-client
```

External projects:

```bash
npm install @verscienta/api-client
```

## Quick Start

```typescript
import { VerslientaClient } from '@verscienta/api-client'

// Initialize the client
const api = new VerslientaClient({
  baseURL: 'https://verscienta.com',
  timeout: 30000,
  onTokenExpired: () => {
    // Handle token expiration
    navigation.navigate('Login')
  },
  onError: (error) => {
    // Handle errors globally
    console.error(error)
  },
})

// Use the API
async function getHerbs() {
  const response = await api.herbs.list({ page: 1, limit: 20 })
  return response.docs
}
```

## API Methods

### Authentication

```typescript
await api.auth.login({ email, password })
await api.auth.register({ email, password, firstName, lastName })
await api.auth.logout()
await api.auth.getSession()
await api.auth.forgotPassword(email)
await api.auth.resetPassword(token, newPassword)
```

### Herbs

```typescript
await api.herbs.list({ page: 1, limit: 20, temperature: 'Warm' })
await api.herbs.get('ginseng') // by slug
await api.herbs.getById('cm123abc')
```

### Formulas

```typescript
await api.formulas.list({ page: 1, limit: 20 })
await api.formulas.get('liu-wei-di-huang-wan')
```

### Conditions

```typescript
await api.conditions.list({ page: 1, limit: 20 })
await api.conditions.get('insomnia')
```

### Practitioners

```typescript
await api.practitioners.list({ page: 1, limit: 20 })
await api.practitioners.get('dr-jane-smith')
await api.practitioners.searchByLocation({
  latitude: 37.7749,
  longitude: -122.4194,
  radius: 50, // km
})
```

### Search

```typescript
await api.search({
  q: 'ginseng',
  type: 'herbs',
  page: 1,
  limit: 20,
})
```

### AI Symptom Analysis

```typescript
// Requires authentication
await api.ai.analyzeSymptoms({
  symptoms: 'persistent cough with clear phlegm',
  age: 35,
  gender: 'female',
})
```

### Mobile Features

```typescript
// Get app configuration
await api.mobile.getConfig()

// Sync data for offline use
await api.mobile.sync({
  lastSyncedAt: '2024-01-01T00:00:00Z',
  collections: ['herbs', 'formulas'],
})

// Push notifications
await api.mobile.registerDevice(deviceToken, 'ios')
await api.mobile.unregisterDevice(deviceToken)

// Optimized images
const url = api.media.getOptimizedImage(originalUrl, {
  width: 400,
  quality: 80,
  format: 'webp',
})
```

## Token Management

```typescript
// Set token after login
api.setToken(token)

// Get current token
const token = api.getToken()

// Clear token on logout
api.setToken(null)
```

## Error Handling

The client automatically handles common errors and calls the `onError` callback:

```typescript
const api = new VerslientaClient({
  baseURL: 'https://verscienta.com',
  onError: (error) => {
    switch (error.statusCode) {
      case 401:
        // Unauthorized
        showLogin()
        break
      case 429:
        // Rate limited
        showToast('Too many requests')
        break
      default:
        showToast(error.message)
    }
  },
})
```

## Development

```bash
# Build client
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check
```

## Documentation

See [MOBILE_APP_GUIDE.md](../../MOBILE_APP_GUIDE.md) for comprehensive mobile integration guide.

## License

Proprietary - Verscienta Health
