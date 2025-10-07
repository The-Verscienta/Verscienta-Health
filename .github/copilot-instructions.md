# Verscienta Health - AI Coding Assistant Instructions

## Architecture Overview

**Monorepo Structure:**
- `apps/web/` - Next.js 15.5.4 frontend (App Router, TypeScript, Tailwind CSS)
- `apps/cms/` - Payload CMS 3.58.0 backend (PostgreSQL, Drizzle ORM)
- `packages/` - Shared utilities (future use)
- Orchestrated with pnpm + Turbo

**Data Flow:**
- Content managed in Payload CMS collections (Herbs, Formulas, Conditions, etc.)
- `algoliaSync` hooks automatically sync published content to Algolia indices
- Frontend queries Algolia for search (`lib/algolia.ts`)
- Authentication via better-auth with PostgreSQL adapter

**Key Integrations:**
- **Search**: Algolia (indices: `verscienta_herbs`, `verscienta_formulas`, etc.)
- **Caching**: DragonflyDB (Redis-compatible, 25x faster than Redis)
- **AI**: Grok API for symptom analysis
- **Maps**: Leaflet + OpenStreetMap for practitioner geo-search
- **Images**: Cloudflare Images for optimization/CDN
- **Email**: Resend for transactional emails

## Development Workflow

**Essential Commands:**
```bash
pnpm dev              # Start both apps (web:3000, cms:3001)
pnpm dev:web          # Frontend only
pnpm dev:cms          # CMS only
pnpm db:migrate       # Run Payload migrations
pnpm db:seed          # Load sample data
pnpm test:e2e         # Playwright E2E tests
pnpm test:a11y        # Accessibility tests (axe-core)
pnpm storybook        # Component documentation
```

**Database Setup:**
- PostgreSQL 17+ required
- Run `pnpm db:migrate` after schema changes
- Use `pnpm db:studio` for Drizzle Studio GUI
- Environment: `DATABASE_URL=postgresql://user:pass@localhost:5432/db`

## Code Patterns & Conventions

**Frontend Architecture:**
- **State**: React Query for server state, Zustand for client state
- **UI**: shadcn/ui + Radix UI primitives, Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Auth**: better-auth client (`lib/auth-client.ts`)
- **API**: Direct Algolia queries, no REST API layer

**CMS Patterns:**
- **Collections**: Rich schemas with groups (botanicalInfo, tcmProperties, etc.)
- **Hooks**: `algoliaSync` for search indexing, `generateSlug` for URLs
- **Access Control**: `isAdminOrEditor`, `isPublished` functions
- **Versions**: Drafts enabled with `maxPerDoc: 50`

**Security & Compliance:**
- **HIPAA**: Database encryption (`lib/db-encryption.ts`), 15-min idle timeouts
- **MFA**: TOTP via better-auth plugins
- **Audit**: All changes logged to `AuditLogs` collection
- **Rate Limiting**: Redis-based (`lib/redis-rate-limiter.ts`)

**Content Management:**
- **Rich Text**: Lexical editor for herb descriptions
- **Media**: Cloudflare Images integration
- **Multi-language**: English, Spanish, Chinese support
- **Validation**: Peer review workflow (`peerReviewStatus` field)

**Testing Strategy:**
- **Unit**: Vitest in `__tests__` directories
- **E2E**: Playwright with custom matchers
- **Accessibility**: axe-core integration, WCAG 2.1 AA target
- **Coverage**: Required for new features

## Common Patterns

**Search Implementation:**
```typescript
// apps/web/lib/algolia.ts
const results = await searchIndex('herbs', query, {
  filters: 'status:published',
  facetFilters: [['tcmProperties.temperature:warm']]
})
```

**CMS Collection Structure:**
```typescript
// apps/cms/src/collections/Herbs.ts
export const Herbs: CollectionConfig = {
  hooks: { afterChange: [algoliaSync('herbs')] },
  fields: [{
    name: 'botanicalInfo',
    type: 'group',
    fields: [/* nested botanical fields */]
  }]
}
```

**Authentication Checks:**
```typescript
// Use better-auth client
const { data: session } = await authClient.getSession()
if (session?.user?.role === 'admin') { /* admin-only logic */ }
```

**Error Handling:**
- Use Sonner for user notifications (`components/ui/sonner`)
- Log errors but don't expose sensitive details
- Graceful degradation for optional services (Algolia, Cloudflare)

**Performance:**
- React Query caching with 1-minute stale time
- DragonflyDB for session/cache storage
- Image optimization via Cloudflare Images
- Database indexes on searchable fields

## File Organization

**Key Directories:**
- `apps/web/components/` - UI components (auth/, cards/, layout/, ui/)
- `apps/web/lib/` - Utilities (algolia.ts, auth.ts, cache.ts)
- `apps/web/hooks/` - Custom React hooks
- `apps/cms/src/collections/` - Payload content models
- `apps/cms/src/hooks/` - Payload hooks (algoliaSync, generateSlug)
- `docs/` - Comprehensive documentation

**Configuration Files:**
- `turbo.json` - Build pipeline configuration
- `eslint.config.js` - Code quality rules
- `tailwind.config.ts` - Design system tokens
- Environment variables in `.env` (copy from `.env.example`)

## Deployment & Production

**Build Process:**
- Turbo orchestrates parallel builds
- Payload generates TypeScript types for frontend
- Static Storybook for component docs

**Environment Setup:**
- Required: DATABASE_URL, PAYLOAD_SECRET, AUTH_SECRET
- Search: ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY
- Optional: Cloudflare, Resend, Grok API keys

**Monitoring:**
- Audit logs for all content changes
- Error tracking (implement Sentry if needed)
- Performance monitoring for search queries

## Getting Started

1. `pnpm install` - Install all dependencies
2. `cp .env.example .env` - Configure environment
3. `pnpm db:migrate` - Set up database schema
4. `pnpm dev` - Start development servers
5. Visit http://localhost:3000 and http://localhost:3001/admin

**First Contribution Areas:**
- Add new herbs to CMS with proper TCM/Western data
- Improve search filters in `lib/search-filters.ts`
- Enhance accessibility in component templates
- Add E2E tests for new features</content>
<parameter name="filePath">c:\Users\pf1\OneDrive\Documents\GitHub\verscienta-health\.github\copilot-instructions.md