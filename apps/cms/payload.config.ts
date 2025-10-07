import { buildConfig } from 'payload'
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
import { ImportLogs } from './src/collections/ImportLogs.js'
import { ValidationReports } from './src/collections/ValidationReports.js'

// Import globals
import { TrefleImportState } from './src/globals/TrefleImportState.js'
import { PerenualImportState } from './src/globals/PerenualImportState.js'

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

  globals: [
    TrefleImportState,
    PerenualImportState,
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

  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },
})
