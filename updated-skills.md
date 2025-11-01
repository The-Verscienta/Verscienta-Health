Verscienta Health Stack Development Guide
PayloadCMS 3.0 + Next.js Architecture
Based on the Verscienta Health repository migrating from Strapi to PayloadCMS 3.0.

Stack Overview
	•	Framework: Next.js 16.0.1 (App Router with React 19)
	•	CMS: PayloadCMS 3.62.0 (Next.js Native)
	•	Database: PostgreSQL 18+
	•	Search: Algolia InstantSearch
	•	Authentication: Better Auth 1.3.34
	•	Caching: DragonflyDB (Redis-compatible, 25x faster)
	•	Package Manager: pnpm
	•	Monorepo: Turborepo

Key Architecture Changes
Why PayloadCMS 3.0?
PayloadCMS 3.0 is “Next.js native” - it installs directly into your Next.js app folder with a single command. Unlike Strapi which requires a separate backend server, Payload integrates completely into your Next.js application.
Benefits:
	•	Use Payload Local API directly in server components - no HTTP latency, direct database access
	•	Deploy serverlessly to Vercel out of the box
	•	Server-side HMR works automatically - no nodemon needed
	•	Single codebase for frontend + backend = simpler deployment
	•	PostgreSQL and Lexical Rich Text Editor are now stable
	•	Type-safe integration between CMS and frontend
Note: Review release notes for versions 3.1–3.62 (e.g., v3.50 added UI enhancements, v3.51 fixed bugs in rich text, v3.62 added jobs access control). No major breaking changes affect this config, but test hooks and adapters.

New Project Structure
verscienta-health/
├── apps/
│   └── web/                          # Combined Next.js + Payload app
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── (app)/           # Public app routes
│       │   │   ├── (admin)/         # Payload admin routes
│       │   │   └── api/             # API routes
│       │   ├── payload/             # Payload CMS configuration
│       │   │   ├── collections/     # Content collections
│       │   │   ├── globals/         # Global settings
│       │   │   ├── hooks/           # Payload hooks
│       │   │   ├── access/          # Access control
│       │   │   └── payload.config.ts
│       │   ├── components/          # React components
│       │   ├── lib/                 # Utilities, clients
│       │   └── types/               # TypeScript types
│       ├── public/                  # Static assets
│       ├── next.config.js           # Next.js config with Payload
│       └── package.json
├── packages/
│   ├── api-types/                   # Shared API TypeScript types
│   ├── api-client/                  # Platform-agnostic API client
│   ├── ui/                          # Shared UI components
│   ├── types/                       # Shared types
│   └── utils/                       # Shared utilities
├── docs/                            # Documentation
├── turbo.json                       # Turborepo configuration
├── pnpm-workspace.yaml              # pnpm workspace
└── package.json                     # Root package
Key Difference: No separate apps/strapi-cms folder! Everything lives in apps/web now.
Note: Pin turbo to ^2.5.8 in root package.json for monorepo stability, as 2.x introduces boundary rules for tasks.

Installation & Setup
1. Install PayloadCMS into Existing Next.js App
cd apps/web

# Install Payload 3.0
npx create-payload-app@latest

# Or add manually:
pnpm add payload@latest @payloadcms/db-postgres @payloadcms/next @payloadcms/richtext-lexical
pnpm add drizzle-orm postgres
2. Update Next.js Config
// apps/web/next.config.js
import { withPayload } from '@payloadcms/next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
3. Create Payload Config
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { r2Adapter } from '@payloadcms/plugin-cloud-storage/r2' // Or custom for Images

// Collections
import { Users } from './collections/Users'
import { Herbs } from './collections/Herbs'
import { Practitioners } from './collections/Practitioners'
import { Formulas } from './collections/Formulas'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  
  // Database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  // Admin Panel
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // Collections
  collections: [
    Users,
    Herbs,
    Practitioners,
    Formulas,
    Media,
  ],

  // Editor
  editor: lexicalEditor(),

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },

  // Cors
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ],

  // CSRF
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ],

  // Plugins
  plugins: [
    cloudStorage({
      collections: {
        'media': {
          adapter: r2Adapter({
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
            accessKeyId: process.env.CLOUDFLARE_API_TOKEN, // Adjust for Images API
            secretAccessKey: '', // Not needed for token auth
            bucket: 'your-bucket',
          }),
        },
      },
    }),
  ],

  // Jobs Queue (new in 3.62)
  jobs: {
    access: {
      queue: isAdmin, // Use access control from access/isAdmin.ts
      cancel: isAdmin,
    },
  },
})
4. Environment Variables
# apps/web/.env.local

# Payload
PAYLOAD_SECRET="your-secret-min-32-chars"
DATABASE_URL="postgresql://user:password@localhost:5432/verscienta_health"

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID="your-app-id"
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="your-search-key"
ALGOLIA_ADMIN_API_KEY="your-admin-key"

# DragonflyDB
REDIS_URL="redis://localhost:6379"

# Cloudflare
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=""
CLOUDFLARE_TURNSTILE_SECRET_KEY=""
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_API_TOKEN=""

# AI
GROK_API_KEY=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="hello@verscienta.com"
5. Setup TypeScript Paths
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@payload-config": ["./src/payload/payload.config.ts"],
      "@/*": ["./src/*"]
    }
  }
}
Note: After updates, run pnpm update to refresh lockfile.

Payload Collections
Users Collection (Authentication)
// apps/web/src/payload/collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Practitioner', value: 'practitioner' },
        { label: 'Herbalist', value: 'herbalist' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'betterAuthId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Linked Better Auth user ID',
      },
    },
  ],
}
Herbs Collection with Algolia Integration
// apps/web/src/payload/collections/Herbs.ts
import type { CollectionConfig } from 'payload'
import { indexToAlgolia, removeFromAlgolia } from '../hooks/algolia'
import { isAdminOrEditor } from '../access/isAdmin'

export const Herbs: CollectionConfig = {
  slug: 'herbs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'scientificName', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'scientificName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'commonNames',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'language',
          type: 'select',
          options: ['en', 'es', 'zh-CN', 'zh-TW'],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    
    // TCM Properties Group
    {
      name: 'tcmProperties',
      type: 'group',
      fields: [
        {
          name: 'temperature',
          type: 'select',
          options: [
            { label: 'Cold', value: 'cold' },
            { label: 'Cool', value: 'cool' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Warm', value: 'warm' },
            { label: 'Hot', value: 'hot' },
          ],
        },
        {
          name: 'taste',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Sweet', value: 'sweet' },
            { label: 'Sour', value: 'sour' },
            { label: 'Bitter', value: 'bitter' },
            { label: 'Pungent', value: 'pungent' },
            { label: 'Salty', value: 'salty' },
            { label: 'Bland', value: 'bland' },
          ],
        },
        {
          name: 'meridians',
          type: 'select',
          hasMany: true,
          options: [
            'Lung', 'Large Intestine', 'Stomach', 'Spleen',
            'Heart', 'Small Intestine', 'Bladder', 'Kidney',
            'Pericardium', 'Triple Burner', 'Gallbladder', 'Liver',
          ],
        },
        {
          name: 'actions',
          type: 'array',
          fields: [{ name: 'action', type: 'text' }],
        },
      ],
    },

    // Western Properties
    {
      name: 'westernProperties',
      type: 'select',
      hasMany: true,
      options: [
        'Adaptogen', 'Anti-inflammatory', 'Antimicrobial',
        'Antioxidant', 'Nervine', 'Diuretic', 'Expectorant',
        'Analgesic', 'Antispasmodic', 'Carminative', 'Demulcent',
        'Hepatic', 'Laxative', 'Sedative', 'Tonic', 'Vulnerary',
        'Emmenagogue', 'Astringent', 'Hypotensive', 'Immunomodulator',
      ],
    },

    // Content
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'safetyInfo',
      type: 'richText',
    },
    {
      name: 'dosage',
      type: 'richText',
    },

    // Media
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    // Metadata
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  
  // Hooks for Algolia sync
  hooks: {
    afterChange: [indexToAlgolia],
    afterDelete: [removeFromAlgolia],
  },
}
Media Collection with Cloudflare Images
// apps/web/src/payload/collections/Media.ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
Note: For Cloudflare Images specifically, implement a custom adapter if direct upload to Images API is needed (see Payload docs). This enables serverless media handling.

Algolia Integration
Algolia Hooks
// apps/web/src/payload/hooks/algolia.ts
import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { algoliasearch } from 'algoliasearch'

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
)

export const indexToAlgolia: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    req.payload.logger.error('Algolia env vars missing');
    return doc;
  }

  try {
    const indexName = req.collection.config.slug
    
    // Transform doc for Algolia
    const algoliaObject = {
      objectID: doc.id,
      ...doc,
      // Flatten nested fields for better search
      'tcmProperties.temperature': doc.tcmProperties?.temperature,
      'tcmProperties.taste': doc.tcmProperties?.taste,
      'tcmProperties.meridians': doc.tcmProperties?.meridians,
      'commonNames': doc.commonNames?.map(cn => cn.name), // Flatten for search
    }

    await client.saveObject({
      indexName,
      body: algoliaObject,
    })

    req.payload.logger.info(`Indexed ${indexName}:${doc.id} to Algolia`)
  } catch (error) {
    req.payload.logger.error(`Failed to index to Algolia: ${error}`)
  }

  return doc
}

export const removeFromAlgolia: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    req.payload.logger.error('Algolia env vars missing');
    return;
  }

  try {
    const indexName = req.collection.config.slug

    await client.deleteObject({
      indexName,
      objectID: doc.id,
    })

    req.payload.logger.info(`Removed ${indexName}:${doc.id} from Algolia`)
  } catch (error) {
    req.payload.logger.error(`Failed to remove from Algolia: ${error}`)
  }
}

Using Payload Local API (Server Components)
Direct Database Access in Server Components
One of the biggest advantages of Payload 3.0 is the Local API - you can access your database directly without any HTTP requests.
// apps/web/src/app/herbs/[slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Herb } from '@/types/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  
  const herbs = await payload.find({
    collection: 'herbs',
    limit: 1000,
  })

  return herbs.docs.map((herb) => ({
    slug: herb.slug,
  }))
}

async function getHerb(slug: string): Promise {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'herbs',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return result.docs[0] || null
}

export default async function HerbPage({
  params,
}: {
  params: { slug: string }
}) {
  const herb = await getHerb(params.slug)

  if (!herb) {
    notFound()
  }

  return (
    
      
{herb.name}
      
{herb.scientificName}
      
      {herb.tcmProperties && (
        
          {herb.tcmProperties.temperature}
          {herb.tcmProperties.taste?.map(taste => (
            {taste}
          ))}
        
      )}

      
        {/* Render rich text */}
      
    
  )
}
Cached API Route with Payload
// apps/web/src/app/api/herbs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cacheGet, cacheSet } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const temperature = searchParams.get('temperature')
  const page = parseInt(searchParams.get('page') || '1')
  
  const cacheKey = `herbs:${temperature}:${page}`
  
  // Check cache
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  // Query Payload
  const payload = await getPayload({ config })
  
  const result = await payload.find({
    collection: 'herbs',
    where: temperature ? {
      'tcmProperties.temperature': {
        equals: temperature,
      },
    } : {},
    page,
    limit: 20,
  })

  // Cache for 1 hour
  await cacheSet(cacheKey, result, 3600)

  return NextResponse.json(result)
}

Better Auth Integration
Sync Better Auth with Payload Users
// apps/web/src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { postgres } from 'better-auth/adapters/postgres'
import { getPayload } from 'payload'
import config from '@payload-config'

export const auth = betterAuth({
  database: postgres({
    connectionString: process.env.DATABASE_URL!,
  }),
  
  emailAndPassword: {
    enabled: true,
  },

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

  // Sync with Payload on user creation
  hooks: {
    after: [
      {
        matcher: (context) => context.path === '/sign-up',
        handler: async (context) => {
          const payload = await getPayload({ config })
          
          await payload.create({
            collection: 'users',
            data: {
              email: context.body.email,
              name: context.body.name,
              betterAuthId: context.user.id,
              role: 'user',
            },
          })
        },
      },
    ],
  },
})
Protected Page with Auth Check
// apps/web/src/app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/signin')
  }

  // Get Payload user data
  const payload = await getPayload({ config })
  const payloadUser = await payload.find({
    collection: 'users',
    where: {
      betterAuthId: {
        equals: session.user.id,
      },
    },
    limit: 1,
  })

  return (
    
      
Welcome, {payloadUser.docs[0]?.name}
      
Role: {payloadUser.docs[0]?.role}
    
  )
}

Access Control
Role-Based Access
// apps/web/src/payload/access/isAdmin.ts
import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  
  return {
    id: {
      equals: user?.id,
    },
  }
}
Apply to Collection
// apps/web/src/payload/collections/Herbs.ts
import { isAdminOrEditor } from '../access/isAdmin'

// ... (already included in Herbs config above)

Migration from Strapi
Data Migration Script
// scripts/migrate-strapi-to-payload.ts
import { getPayload } from 'payload'
import config from '../apps/web/src/payload/payload.config'
import { chunk } from 'lodash' // Add lodash or implement chunk

async function migrateData() {
  const payload = await getPayload({ config })

  // Fetch from Strapi API
  const strapiHerbs = await fetch(
    'http://localhost:3001/api/herbs?pagination[limit]=10000&populate=*'
  ).then(res => res.json())

  console.log(`Migrating ${strapiHerbs.data.length} herbs...`)

  const batches = chunk(strapiHerbs.data, 50); // Batch for large datasets

  for (const batch of batches) {
    for (const strapiHerb of batch) {
      try {
        await payload.create({
          collection: 'herbs',
          data: {
            name: strapiHerb.attributes.name,
            scientificName: strapiHerb.attributes.scientificName,
            slug: strapiHerb.attributes.slug,
            tcmProperties: {
              temperature: strapiHerb.attributes.tcmProperties?.temperature,
              taste: strapiHerb.attributes.tcmProperties?.taste,
              meridians: strapiHerb.attributes.tcmProperties?.meridians,
              actions: strapiHerb.attributes.tcmProperties?.actions,
            },
            westernProperties: strapiHerb.attributes.westernProperties,
            description: strapiHerb.attributes.description,
            safetyInfo: strapiHerb.attributes.safetyInfo,
            publishedAt: strapiHerb.attributes.publishedAt,
            // Handle media: Create media docs and relate (expand as needed)
          },
        })
        console.log(`✓ Migrated: ${strapiHerb.attributes.name}`)
      } catch (error) {
        console.error(`✗ Failed: ${strapiHerb.attributes.name}`, error)
      }
    }
  }

  console.log('Migration complete!')
}

migrateData()
Run migration:
tsx scripts/migrate-strapi-to-payload.ts
Note: After running the script, verify data with pnpm payload seed or manual admin checks. Test Algolia sync on a subset.

Development Workflows
Starting Development
# Install dependencies
pnpm install

# Start development server (includes Payload admin)
pnpm dev

# Payload admin available at: http://localhost:3000/admin
# Frontend available at: http://localhost:3000
Generate TypeScript Types
# Generate Payload types automatically
pnpm payload generate:types

# Types will be generated to: src/types/payload-types.ts
Database
# Generate migration
pnpm payload migrate:create

# Run migrations
pnpm payload migrate

# Reset database (careful!)
pnpm payload migrate:reset

Deployment Changes
Single App Deployment
Before (Strapi):
	•	Deploy apps/web → Frontend
	•	Deploy apps/strapi-cms → Backend
	•	Two separate services
After (Payload 3.0):
	•	Deploy apps/web → Everything!
	•	Single Next.js app includes CMS
	•	Simpler infrastructure
Coolify Deployment
# apps/web/Dockerfile
FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
Vercel Deployment
Payload 3.0 can now deploy serverlessly to Vercel out of the box!
# Simply deploy to Vercel
vercel

# Or connect via Vercel dashboard
# Auto-deploys on git push
Note: With Next 16, add vercel.json for custom caching if using DragonflyDB.

Best Practices
1. Use Local API Everywhere Possible
// ✅ Good - Direct database access
const payload = await getPayload({ config })
const herbs = await payload.find({ collection: 'herbs' })

// ❌ Avoid - Unnecessary HTTP overhead
const herbs = await fetch('/api/herbs').then(r => r.json())
2. Leverage Server Components
// ✅ Server Component - Direct Payload access
export default async function Page() {
  const payload = await getPayload({ config })
  const data = await payload.find({ collection: 'herbs' })
  return 
{/* render */}
}
3. Cache Expensive Queries
// Use DragonflyDB for frequently accessed data
const cached = await cacheGet('popular-herbs')
if (!cached) {
  const payload = await getPayload({ config })
  const data = await payload.find({ ... })
  await cacheSet('popular-herbs', data, 3600)
}
4. Type Safety
// Always import generated types
import type { Herb } from '@/types/payload-types'

const herb: Herb = await payload.findByID({
  collection: 'herbs',
  id: '123',
})
5. Use Jobs Queue for Tasks
For large-scale indexing or migrations, use Payload’s jobs queue to offload tasks.

Troubleshooting
Payload admin won’t load
	•	Check PAYLOAD_SECRET is set
	•	Verify DATABASE_URL connection
	•	Run pnpm payload migrate
Types not generating
	•	Run pnpm payload generate:types
	•	Check typescript.outputFile in config
	•	Restart TypeScript server in IDE
Build errors
	•	Ensure withPayload() wraps Next.js config
	•	Check all Payload dependencies are installed
	•	Clear .next folder and rebuild
	•	Check Drizzle ORM version compatibility with PostgreSQL 18
	•	For Next 16 build errors, enable turbo in turbo.json for monorepo builds.

Resources
	•	Payload 3.0 Documentation
	•	Payload + Next.js Guide
	•	Migration Guide v2 → v3
	•	Payload 3.x Changelog
	•	Verscienta Health Docs
Disclaimer: This is a proposed migration; the live repo still uses Strapi—implement in a feature branch.

Built with ❤️ for Verscienta Health - Now with Payload 3.0!
