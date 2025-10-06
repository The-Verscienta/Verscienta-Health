import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Import collections
import { Herbs } from './src/collections/Herbs.js'
import { Formulas } from './src/collections/Formulas.js'
import { Conditions } from './src/collections/Conditions.js'
import { Symptoms } from './src/collections/Symptoms.js'
import { Modalities } from './src/collections/Modalities.js'
import { Practitioners } from './src/collections/Practitioners.js'
import { Reviews } from './src/collections/Reviews.js'
import { GrokInsights } from './src/collections/GrokInsights.js'
import { Media } from './src/collections/Media.js'
import { Users } from './src/collections/Users.js'
import { AuditLogs } from './src/collections/AuditLogs.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Verscienta Health',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
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
  ],

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  typescript: {
    outputFile: path.resolve(dirname, '../web/types/payload-types.ts'),
  },

  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  cors: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ],

  csrf: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ],

  rateLimit: {
    trustProxy: true,
    max: 2000,
    window: 900000, // 15 minutes
  },

  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },
})
