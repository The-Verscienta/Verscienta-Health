import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { AuditLogs } from './src/collections/AuditLogs.js'
import { Conditions } from './src/collections/Conditions.js'
import { Formulas } from './src/collections/Formulas.js'
import { GrokInsights } from './src/collections/GrokInsights.js'
// Import collections
import { Herbs } from './src/collections/Herbs.js'
import { ImportLogs } from './src/collections/ImportLogs.js'
import { Media } from './src/collections/Media.js'
import { Modalities } from './src/collections/Modalities.js'
import { Practitioners } from './src/collections/Practitioners.js'
import { Reviews } from './src/collections/Reviews.js'
import { Symptoms } from './src/collections/Symptoms.js'
import { Users } from './src/collections/Users.js'
import { ValidationReports } from './src/collections/ValidationReports.js'
import { PerenualImportState } from './src/globals/PerenualImportState.js'
// Import globals
import { TrefleImportState } from './src/globals/TrefleImportState.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Verscienta Health',
    },
    dateFormat: 'MMMM do, yyyy',
  },

  collections: [
    Herbs,
    Formulas,
    Conditions,
    Symptoms,
    Modalities,
    Practitioners,
    Reviews,
    GrokInsights,
    Media,
    Users,
    AuditLogs,
    ImportLogs,
    ValidationReports,
  ],

  globals: [TrefleImportState, PerenualImportState],

  editor: lexicalEditor({}),

  plugins: [
    s3Storage({
      collections: {
        media: true, // Enable S3 storage for media collection
      },
      bucket: process.env.CLOUDFLARE_BUCKET_NAME || 'verscienta-media',
      config: {
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
        },
        region: 'auto', // Cloudflare R2 uses 'auto' for region
        // Cloudflare R2 endpoint format
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      },
    }),
    seoPlugin({
      collections: ['herbs', 'conditions', 'formulas', 'practitioners', 'modalities', 'symptoms', 'reviews'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: { doc: any }) => `${doc?.name || doc?.title || 'Verscienta Health'}`,
      generateDescription: ({ doc }: { doc: any }) => {
        // Try to extract first 160 chars from various text fields
        let text = doc?.description || doc?.summary || doc?.bio || doc?.comment || ''

        // Handle richText fields (Lexical format) - extract plain text
        if (text && typeof text === 'object' && text.root) {
          // Simple extraction from Lexical JSON
          const extractText = (node: any): string => {
            if (node.text) return node.text
            if (node.children) {
              return node.children.map(extractText).join(' ')
            }
            return ''
          }
          text = extractText(text.root)
        }

        if (typeof text === 'string' && text.length > 0) {
          return text.slice(0, 160)
        }
        return 'Discover holistic health wisdom on Verscienta Health'
      },
      generateURL: ({ doc, collectionConfig }: any) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'
        const slug = doc?.slug || doc?.id
        return `${baseUrl}/${collectionConfig?.slug}/${slug}`
      },
    }),
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      // SSL configuration for managed databases (Supabase, DigitalOcean, etc.)
      ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
      // Connection pooling best practices for production
      max: process.env.NODE_ENV === 'production' ? 20 : 10, // Max connections
      min: process.env.NODE_ENV === 'production' ? 5 : 2, // Min connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 5000, // Timeout for new connection attempts
      maxUses: 7500, // Recycle connection after 7500 uses
      allowExitOnIdle: process.env.NODE_ENV !== 'production', // Allow graceful shutdown in dev
    },
    // Push database changes without down migrations (Payload v3 default)
    push: process.env.NODE_ENV === 'development',
    // Enable migrations in production
    migrationDir: './migrations',
  }),

  typescript: {
    outputFile: path.resolve(dirname, '../web/types/payload-types.ts'),
  },

  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  cors: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', 'http://localhost:3000'],

  csrf: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', 'http://localhost:3000'],

  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },
})
