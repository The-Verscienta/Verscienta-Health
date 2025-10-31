# Payload CMS Collection Templates

This document contains templates for the remaining collections to complete the Strapi → Payload migration.

## Completed Collections ✅
- ✅ Users
- ✅ Media
- ✅ Herbs (40+ fields, 15 components)
- ✅ Formulas (ingredient system with herb relations)
- ✅ Conditions (TCM patterns, symptoms)

## Remaining Collections

### 1. Symptoms Collection

**Strapi Schema**: `apps/strapi-cms/src/api/symptom/content-types/symptom/schema.json`

```typescript
// apps/payload-cms/src/collections/Symptoms.ts
import type { CollectionConfig } from 'payload'

export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'severity', 'updatedAt'],
    description: 'Symptom database for AI symptom checker',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'tcmInterpretation',
      type: 'richText',
      admin: {
        description: 'Traditional Chinese Medicine interpretation',
      },
    },
    {
      name: 'westernInterpretation',
      type: 'richText',
      admin: {
        description: 'Western medicine interpretation',
      },
    },
    {
      name: 'severity',
      type: 'select',
      options: [
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
        { label: 'Emergency', value: 'emergency' },
      ],
    },
    {
      name: 'redFlags',
      type: 'richText',
      admin: {
        description: 'Warning signs that require immediate medical attention',
      },
    },
    {
      name: 'commonCauses',
      type: 'array',
      admin: {
        description: 'Common causes of this symptom',
      },
      fields: [
        {
          name: 'cause',
          type: 'text',
          required: true,
        },
        {
          name: 'likelihood',
          type: 'select',
          options: [
            { label: 'Very Common', value: 'very_common' },
            { label: 'Common', value: 'common' },
            { label: 'Uncommon', value: 'uncommon' },
            { label: 'Rare', value: 'rare' },
          ],
        },
      ],
    },
    {
      name: 'relatedConditions',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
    },
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      admin: {
        description: 'Herbs that may help with this symptom',
      },
    },
  ],
  timestamps: true,
}
```

---

### 2. Practitioners Collection

**Strapi Schema**: `apps/strapi-cms/src/api/practitioner/content-types/practitioner/schema.json`

```typescript
// apps/payload-cms/src/collections/Practitioners.ts
import type { CollectionConfig } from 'payload'

export const Practitioners: CollectionConfig = {
  slug: 'practitioners',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'practitionerName', 'verificationStatus', 'city', 'state'],
    description: 'Verified practitioner directory',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      admin: {
        description: 'Linked user account',
      },
    },
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'practitionerName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    // Credentials
    {
      name: 'credentials',
      type: 'array',
      admin: {
        description: 'Professional certifications and licenses',
      },
      fields: [
        {
          name: 'credentialType',
          type: 'text',
          required: true,
        },
        {
          name: 'credentialNumber',
          type: 'text',
        },
        {
          name: 'issuingOrganization',
          type: 'text',
        },
        {
          name: 'issueDate',
          type: 'date',
        },
        {
          name: 'expiryDate',
          type: 'date',
        },
      ],
    },

    // Specialties
    {
      name: 'specialties',
      type: 'array',
      fields: [
        {
          name: 'specialty',
          type: 'text',
          required: true,
        },
      ],
    },

    // Languages
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
        {
          name: 'proficiency',
          type: 'select',
          options: [
            { label: 'Native', value: 'native' },
            { label: 'Fluent', value: 'fluent' },
            { label: 'Conversational', value: 'conversational' },
          ],
        },
      ],
    },

    // Address
    {
      name: 'addresses',
      type: 'array',
      fields: [
        {
          name: 'addressType',
          type: 'select',
          options: [
            { label: 'Primary Office', value: 'primary' },
            { label: 'Secondary Office', value: 'secondary' },
            { label: 'Clinic', value: 'clinic' },
          ],
        },
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'zipCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'USA',
        },
        {
          name: 'latitude',
          type: 'number',
        },
        {
          name: 'longitude',
          type: 'number',
        },
      ],
    },

    // Insurance
    {
      name: 'insuranceProviders',
      type: 'array',
      fields: [
        {
          name: 'provider',
          type: 'text',
          required: true,
        },
      ],
    },

    // Pricing
    {
      name: 'pricing',
      type: 'array',
      fields: [
        {
          name: 'serviceType',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Duration in minutes',
          },
        },
      ],
    },

    // Contact
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },

    // Relationships
    {
      name: 'modalities',
      type: 'relationship',
      relationTo: 'modalities',
      hasMany: true,
    },

    // Verification
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'verificationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.verificationStatus !== 'pending',
      },
    },

    // Reviews
    {
      name: 'averageRating',
      type: 'number',
      min: 0,
      max: 5,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      min: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
```

---

### 3. Modalities Collection

**Strapi Schema**: `apps/strapi-cms/src/api/modality/content-types/modality/schema.json`

```typescript
// apps/payload-cms/src/collections/Modalities.ts
import type { CollectionConfig } from 'payload'

export const Modalities: CollectionConfig = {
  slug: 'modalities',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'updatedAt'],
    description: 'Healing modalities and treatment approaches',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Type of modality (TCM, Ayurveda, Western, etc.)',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'certificationBodies',
      type: 'array',
      admin: {
        description: 'Certification organizations for this modality',
      },
      fields: [
        {
          name: 'organizationName',
          type: 'text',
          required: true,
        },
        {
          name: 'website',
          type: 'text',
        },
        {
          name: 'certificationLevel',
          type: 'text',
        },
      ],
    },
    {
      name: 'excelsAt',
      type: 'array',
      admin: {
        description: 'Conditions this modality excels at treating',
      },
      fields: [
        {
          name: 'conditionType',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'treatmentApproaches',
      type: 'array',
      fields: [
        {
          name: 'approach',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'trainingRequirements',
      type: 'richText',
    },
    {
      name: 'relatedConditions',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
    },
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
    },
  ],
  timestamps: true,
}
```

---

### 4. Reviews Collection (Polymorphic)

**Strapi Schema**: `apps/strapi-cms/src/api/review/content-types/review/schema.json`

```typescript
// apps/payload-cms/src/collections/Reviews.ts
import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'reviewedEntityType', 'moderationStatus', 'createdAt'],
    description: 'User reviews for herbs, formulas, practitioners, and modalities',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },

    // Polymorphic relationship - Payload supports this with relationTo array
    {
      name: 'reviewedEntity',
      type: 'relationship',
      relationTo: ['herbs', 'formulas', 'practitioners', 'modalities'],
      required: true,
      admin: {
        description: 'Select the item being reviewed',
      },
    },

    // Store the type for easier querying
    {
      name: 'reviewedEntityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Herb', value: 'herb' },
        { label: 'Formula', value: 'formula' },
        { label: 'Practitioner', value: 'practitioner' },
        { label: 'Modality', value: 'modality' },
      ],
      admin: {
        description: 'Auto-populated based on reviewedEntity',
      },
    },

    // Author
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },

    // Moderation
    {
      name: 'moderationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Flagged', value: 'flagged' },
      ],
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.moderationStatus !== 'pending',
      },
    },

    // Helpfulness
    {
      name: 'helpfulCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notHelpfulCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-populate reviewedEntityType based on reviewedEntity
        if (data.reviewedEntity && typeof data.reviewedEntity === 'object') {
          const entityTypeMap = {
            herbs: 'herb',
            formulas: 'formula',
            practitioners: 'practitioner',
            modalities: 'modality',
          }
          data.reviewedEntityType = entityTypeMap[data.reviewedEntity.relationTo]
        }
        return data
      },
    ],
  },
}
```

---

### 5. Grok-Insights Collection

**Strapi Schema**: `apps/strapi-cms/src/api/grok-insight/content-types/grok-insight/schema.json`

```typescript
// apps/payload-cms/src/collections/GrokInsights.ts
import type { CollectionConfig } from 'payload'

export const GrokInsights: CollectionConfig = {
  slug: 'grok-insights',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'query', 'sessionId', 'createdAt'],
    description: 'AI-generated health insights from symptom checker',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Session identifier for grouping related queries',
      },
    },
    {
      name: 'query',
      type: 'textarea',
      required: true,
      admin: {
        description: 'User\'s symptom description or question',
      },
    },
    {
      name: 'response',
      type: 'richText',
      required: true,
      admin: {
        description: 'AI-generated response',
      },
    },
    {
      name: 'recommendations',
      type: 'array',
      admin: {
        description: 'AI recommendations',
      },
      fields: [
        {
          name: 'recommendation',
          type: 'text',
          required: true,
        },
        {
          name: 'confidence',
          type: 'number',
          min: 0,
          max: 1,
        },
      ],
    },
    {
      name: 'followUpQuestions',
      type: 'array',
      admin: {
        description: 'Suggested follow-up questions',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
    },
    {
      name: 'relatedConditions',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
    },
    {
      name: 'tokensUsed',
      type: 'number',
      admin: {
        description: 'AI tokens consumed',
        readOnly: true,
      },
    },
    {
      name: 'model',
      type: 'text',
      admin: {
        description: 'AI model used',
      },
    },
  ],
  timestamps: true,
}
```

---

### 6. Audit-Logs Collection (HIPAA Compliant)

```typescript
// apps/payload-cms/src/collections/AuditLogs.ts
import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'entityType', 'user', 'ipAddress', 'createdAt'],
    description: 'HIPAA-compliant immutable audit logs',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => true, // System-level creation
    update: () => false, // Immutable
    delete: () => false, // Immutable
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        // ... 30+ action types
        { label: 'User Login', value: 'user_login' },
        { label: 'User Logout', value: 'user_logout' },
        { label: 'PHI Access', value: 'phi_access' },
        { label: 'Record Created', value: 'record_created' },
        { label: 'Record Updated', value: 'record_updated' },
        { label: 'Record Deleted', value: 'record_deleted' },
        // Add all 30+ action types from Strapi
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'entityType',
      type: 'text',
    },
    {
      name: 'entityId',
      type: 'text',
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'details',
      type: 'json',
    },
    {
      name: 'securityLevel',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
  ],
  timestamps: true,
}
```

---

### 7. Import-Logs, Validation-Reports

Similar patterns - copy from Strapi schemas and adapt.

---

### 8. Trefle-Import-State (Global)

```typescript
// apps/payload-cms/src/globals/TrefleImportState.ts
import type { GlobalConfig } from 'payload'

export const TrefleImportState: GlobalConfig = {
  slug: 'trefle-import-state',
  admin: {
    description: 'Tracks progressive import of plants from Trefle API',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'currentPage',
      type: 'number',
      defaultValue: 1,
      required: true,
    },
    {
      name: 'totalPages',
      type: 'number',
    },
    {
      name: 'recordsImported',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'lastImportDate',
      type: 'date',
    },
    {
      name: 'importStatus',
      type: 'select',
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'not_started',
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
```

---

## Next Steps

1. **Create Remaining Collections**:
   - Copy templates above into respective files
   - Add to payload.config.ts imports and collections array

2. **Port Trefle Library**:
   ```bash
   cp apps/strapi-cms/src/lib/trefle.ts apps/payload-cms/src/lib/trefle.ts
   ```
   - Update imports for Payload
   - Keep all business logic intact

3. **Create Payload Jobs** (replaces cron):
   - `src/jobs/syncTrefleData.ts`
   - `src/jobs/importTrefleData.ts`

4. **Create Algolia Hooks**:
   - `src/hooks/algolia-sync.ts`
   - Add `afterChange` hooks to Herbs, Formulas, Conditions, Practitioners

5. **Database Setup**:
   - Install PostgreSQL locally OR use cloud provider (Supabase, Neon, Vercel Postgres)
   - Update `DATABASE_URI` in `.env`
   - Run `pnpm payload migrate`

6. **Test Build**:
   ```bash
   cd apps/payload-cms
   pnpm dev
   ```

7. **Frontend Integration**:
   - Create `apps/web/lib/payload-api.ts`
   - Refactor all `@/lib/strapi-api` imports
   - Update response format handling

---

## Migration Status Dashboard

Track progress here:

| Collection | Status | Notes |
|------------|--------|-------|
| Users | ✅ Complete | Basic auth |
| Media | ✅ Complete | Upload collection |
| Herbs | ✅ Complete | 40+ fields, 15 components |
| Formulas | ✅ Complete | Ingredient system |
| Conditions | ✅ Complete | TCM patterns |
| Symptoms | ⏳ Template ready | Use template above |
| Practitioners | ⏳ Template ready | Use template above |
| Modalities | ⏳ Template ready | Use template above |
| Reviews | ⏳ Template ready | Polymorphic relations |
| Grok-Insights | ⏳ Template ready | AI insights |
| Audit-Logs | ⏳ Template ready | HIPAA compliant |
| Import-Logs | ⏳ Pending | Create from Strapi schema |
| Validation-Reports | ⏳ Pending | Create from Strapi schema |
| Trefle-Import-State | ⏳ Template ready | Global config |
