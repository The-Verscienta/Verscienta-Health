# @verscienta/api-types

Shared TypeScript type definitions for the Verscienta Health platform.

## Purpose

This package provides type-safe definitions that are shared across:
- Web application (Next.js)
- Mobile applications (React Native, Flutter via bridge)
- Backend services (Payload CMS)

## Installation

Within the monorepo:

```bash
pnpm add @verscienta/api-types
```

## Usage

```typescript
import type { Herb, Formula, Condition, User } from '@verscienta/api-types'

// Use types in your code
const herb: Herb = {
  id: '123',
  slug: 'ginseng',
  name: 'Ginseng',
  // ... other properties
}
```

## Available Types

### Core Entities
- `Herb` - Herbal medicine data
- `Formula` - Herbal formula compositions
- `Condition` - Health conditions
- `Practitioner` - Healthcare practitioners

### Authentication
- `User` - User account data
- `Session` - User session
- `LoginRequest` / `RegisterRequest`

### API Responses
- `PaginatedResponse<T>` - Paginated data
- `SearchResponse` - Search results
- `ApiError` - Error responses

### Mobile-Specific
- `AppConfig` - Mobile app configuration
- `SyncRequest` / `SyncResponse` - Offline sync

See `src/index.ts` for complete type definitions.

## Development

```bash
# Build types
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check
```

## License

Proprietary - Verscienta Health
