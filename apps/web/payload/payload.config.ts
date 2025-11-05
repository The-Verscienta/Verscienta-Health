import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Herbs } from './collections/Herbs'
import { Practitioners } from './collections/Practitioners'
import { Formulas } from './collections/Formulas'
import { Conditions } from './collections/Conditions'
import { Symptoms } from './collections/Symptoms'
import { Modalities } from './collections/Modalities'
import { Reviews } from './collections/Reviews'
import { GrokInsights } from './collections/GrokInsights'
import { AuditLogs } from './collections/AuditLogs'
import { ImportLogs } from './collections/ImportLogs'
import { ValidationReports } from './collections/ValidationReports'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || '',

  // Database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true, // Temporarily enable auto-push to create schema (disable in production)
  }),

  // Admin Panel
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Verscienta Health',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // Collections
  collections: [
    Users,
    Media,
    Herbs,
    Practitioners,
    Formulas,
    Conditions,
    Symptoms,
    Modalities,
    Reviews,
    GrokInsights,
    AuditLogs,
    ImportLogs,
    ValidationReports,
  ],

  // Globals
  globals: [
    // TrefleImportState,
  ],

  // Jobs Queue
  jobs: {
    tasks: [
      // Will add Trefle sync jobs here
    ],
  },

  // Editor
  editor: lexicalEditor({}),

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },

  // Sharp for image processing
  sharp,

  // Plugins
  plugins: [
    // Cloudflare R2 Storage will be added after initial setup
  ],

  // CORS configuration
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),

  // CSRF configuration
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),

  // Server URL
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL,

  // GraphQL
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // Upload settings
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
})
