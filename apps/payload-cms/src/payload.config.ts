import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// import { s3Storage } from '@payloadcms/plugin-cloud-storage'
// import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Herbs } from './collections/Herbs'
import { Formulas } from './collections/Formulas'
import { Conditions } from './collections/Conditions'
import { Symptoms } from './collections/Symptoms'
import { Practitioners } from './collections/Practitioners'
import { Modalities } from './collections/Modalities'
import { Reviews } from './collections/Reviews'
import { GrokInsights } from './collections/GrokInsights'
import { AuditLogs } from './collections/AuditLogs'
import { ImportLogs } from './collections/ImportLogs'
import { ValidationReports } from './collections/ValidationReports'

// Globals
import { TrefleImportState } from './globals/TrefleImportState'

// Jobs
import { syncTrefleDataJob } from './jobs/syncTrefleData'
import { importTrefleDataJob } from './jobs/importTrefleData'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Verscienta Health',
    },
  },

  collections: [
    Users,
    Media,
    Herbs,
    Formulas,
    Conditions,
    Symptoms,
    Practitioners,
    Modalities,
    Reviews,
    GrokInsights,
    AuditLogs,
    ImportLogs,
    ValidationReports,
  ],

  globals: [
    TrefleImportState,
  ],

  jobs: {
    tasks: [
      {
        slug: 'sync-trefle-data',
        handler: syncTrefleDataJob,
        schedule: [{ cron: '0 3 * * 3', queue: 'default' }], // Every Wednesday at 3 AM
      },
      {
        slug: 'import-trefle-data',
        handler: importTrefleDataJob,
        schedule: [{ cron: '*/1 * * * *', queue: 'low-priority' }], // Every minute (when ENABLE_TREFLE_IMPORT=true)
      },
    ],
  },

  editor: lexicalEditor({}),

  secret: process.env.PAYLOAD_SECRET || process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
    },
    // Uncomment for development with SQLite:
    // migrationDir: path.resolve(dirname, 'migrations'),
  }),

  sharp,

  plugins: [
    // Cloudflare R2 Storage (S3-compatible) - will be added after initial setup
    // s3Storage({
    //   collections: {
    //     media: true,
    //   },
    //   bucket: process.env.CLOUDFLARE_BUCKET_NAME || '',
    //   config: {
    //     credentials: {
    //       accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    //       secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    //     },
    //     region: 'auto',
    //     endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_HASH}.r2.cloudflarestorage.com`,
    //   },
    // }),

    // Sentry plugin (optional)
    // sentryPlugin({
    //   dsn: process.env.SENTRY_DSN,
    //   options: {
    //     environment: process.env.NODE_ENV,
    //   },
    // }),
  ],

  // CORS configuration
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // CSRF configuration
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // Default limits for queries
  defaultMaxLimit: 100,
  defaultLimit: 25,

  // Server URL
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,

  // GraphQL
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // Rate limiting
  rateLimit: {
    max: 500,
    trustProxy: true,
  },

  // Upload settings
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
})
