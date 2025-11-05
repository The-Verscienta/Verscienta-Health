import type { CollectionConfig } from 'payload'
import { algoliaAfterChangeHook, algoliaAfterDeleteHook } from '../hooks/algolia-sync'
import { isPublic, isAuthenticated, isAdmin } from '../access'

export const Herbs: CollectionConfig = {
  slug: 'herbs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'peerReviewStatus', 'averageRating', 'updatedAt'],
    description: 'Comprehensive herb database with TCM and Western herbalism properties',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    // Basic Information
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
      admin: {
        description: 'URL-friendly version of the title',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'herbId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Unique identifier for the herb',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },

    // Media
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'photoGallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: false,
    },

    // Botanical Information
    {
      name: 'botanicalInfo',
      type: 'group',
      fields: [
        {
          name: 'scientificName',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'family',
          type: 'text',
        },
        {
          name: 'genus',
          type: 'text',
        },
        {
          name: 'species',
          type: 'text',
        },
        {
          name: 'plantType',
          type: 'select',
          options: [
            { label: 'Herb', value: 'herb' },
            { label: 'Shrub', value: 'shrub' },
            { label: 'Tree', value: 'tree' },
            { label: 'Vine', value: 'vine' },
            { label: 'Grass', value: 'grass' },
            { label: 'Fern', value: 'fern' },
            { label: 'Moss', value: 'moss' },
            { label: 'Fungus', value: 'fungus' },
            { label: 'Lichen', value: 'lichen' },
          ],
        },
        {
          name: 'habitat',
          type: 'textarea',
        },
        {
          name: 'partsUsed',
          type: 'json',
          admin: {
            description: 'Array of plant parts used medicinally',
          },
        },
        {
          name: 'botanicalDescription',
          type: 'richText',
        },
        {
          name: 'trefleId',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Trefle API plant ID',
          },
        },
        {
          name: 'trefleSlug',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Trefle API slug',
          },
        },
        {
          name: 'lastSyncedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last synced with Trefle database',
          },
        },
      ],
    },

    // Common Names
    {
      name: 'commonNames',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'language',
          type: 'select',
          required: true,
          options: [
            { label: 'English', value: 'en' },
            { label: 'Chinese (Pinyin)', value: 'zh-pinyin' },
            { label: 'Chinese', value: 'zh' },
            { label: 'Spanish', value: 'es' },
            { label: 'Native', value: 'native' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'region',
          type: 'text',
        },
      ],
    },

    // Synonyms
    {
      name: 'synonyms',
      type: 'array',
      admin: {
        description: 'Scientific name variants and synonyms',
      },
      fields: [
        {
          name: 'scientificName',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Accepted', value: 'accepted' },
            { label: 'Synonym', value: 'synonym' },
            { label: 'Misapplied', value: 'misapplied' },
          ],
        },
      ],
    },

    // Native Region
    {
      name: 'nativeRegion',
      type: 'array',
      fields: [
        {
          name: 'region',
          type: 'text',
          required: true,
        },
        {
          name: 'countries',
          type: 'json',
        },
      ],
    },

    // Cultivation
    {
      name: 'cultivation',
      type: 'group',
      fields: [
        {
          name: 'growingConditions',
          type: 'richText',
        },
        {
          name: 'propagation',
          type: 'text',
        },
        {
          name: 'harvestTime',
          type: 'text',
        },
        {
          name: 'soilRequirements',
          type: 'text',
        },
        {
          name: 'sunlightRequirements',
          type: 'select',
          options: [
            { label: 'Full Sun', value: 'full_sun' },
            { label: 'Partial Sun', value: 'partial_sun' },
            { label: 'Partial Shade', value: 'partial_shade' },
            { label: 'Full Shade', value: 'full_shade' },
          ],
        },
        {
          name: 'waterRequirements',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
        },
      ],
    },

    // Conservation
    {
      name: 'conservationStatus',
      type: 'select',
      options: [
        { label: 'Least Concern', value: 'least_concern' },
        { label: 'Near Threatened', value: 'near_threatened' },
        { label: 'Vulnerable', value: 'vulnerable' },
        { label: 'Endangered', value: 'endangered' },
        { label: 'Critically Endangered', value: 'critically_endangered' },
        { label: 'Extinct in Wild', value: 'extinct_wild' },
        { label: 'Not Evaluated', value: 'not_evaluated' },
        { label: 'Data Deficient', value: 'data_deficient' },
      ],
    },
    {
      name: 'conservationNotes',
      type: 'richText',
    },

    // TCM Properties
    {
      name: 'tcmProperties',
      type: 'group',
      admin: {
        description: 'Traditional Chinese Medicine properties',
      },
      fields: [
        {
          name: 'tcmTaste',
          type: 'json',
          admin: {
            description: 'Array of tastes: sweet, sour, bitter, pungent, salty',
          },
        },
        {
          name: 'tcmTemperature',
          type: 'select',
          options: [
            { label: 'Hot', value: 'hot' },
            { label: 'Warm', value: 'warm' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Cool', value: 'cool' },
            { label: 'Cold', value: 'cold' },
          ],
        },
        {
          name: 'tcmMeridians',
          type: 'json',
          admin: {
            description: 'Array of meridians/channels affected',
          },
        },
        {
          name: 'tcmFunctions',
          type: 'richText',
          admin: {
            description: 'TCM functions and actions',
          },
        },
        {
          name: 'tcmCategory',
          type: 'text',
        },
        {
          name: 'tcmTraditionalUses',
          type: 'richText',
        },
      ],
    },

    // Western Herbalism
    {
      name: 'westernProperties',
      type: 'json',
      admin: {
        description: 'Western herbalism properties and energetics',
      },
    },
    {
      name: 'therapeuticUses',
      type: 'richText',
    },
    {
      name: 'traditionalAmericanUses',
      type: 'richText',
    },
    {
      name: 'nativeAmericanUses',
      type: 'richText',
    },

    // Scientific Information
    {
      name: 'activeConstituents',
      type: 'array',
      admin: {
        description: 'Active chemical compounds',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'concentration',
          type: 'text',
        },
      ],
    },
    {
      name: 'pharmacologicalEffects',
      type: 'richText',
    },
    {
      name: 'clinicalStudies',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'authors',
          type: 'text',
        },
        {
          name: 'journal',
          type: 'text',
        },
        {
          name: 'year',
          type: 'number',
        },
        {
          name: 'doi',
          type: 'text',
          admin: {
            description: 'Digital Object Identifier',
          },
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'summary',
          type: 'textarea',
        },
      ],
    },

    // Dosage & Preparation
    {
      name: 'dosageForms',
      type: 'json',
      admin: {
        description: 'Available dosage forms (tea, tincture, capsule, etc.)',
      },
    },
    {
      name: 'recommendedDosage',
      type: 'array',
      fields: [
        {
          name: 'form',
          type: 'text',
          required: true,
          admin: {
            description: 'Dosage form (tea, tincture, capsule, etc.)',
          },
        },
        {
          name: 'amount',
          type: 'text',
          required: true,
        },
        {
          name: 'frequency',
          type: 'text',
        },
        {
          name: 'duration',
          type: 'text',
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'preparationMethods',
      type: 'array',
      fields: [
        {
          name: 'method',
          type: 'text',
          required: true,
        },
        {
          name: 'instructions',
          type: 'richText',
          required: true,
        },
        {
          name: 'duration',
          type: 'text',
        },
      ],
    },

    // Safety Information
    {
      name: 'safetyInfo',
      type: 'group',
      fields: [
        {
          name: 'contraindications',
          type: 'richText',
          admin: {
            description: 'Conditions where this herb should not be used',
          },
        },
        {
          name: 'warnings',
          type: 'richText',
        },
        {
          name: 'sideEffects',
          type: 'richText',
        },
        {
          name: 'pregnancySafety',
          type: 'select',
          options: [
            { label: 'Safe', value: 'safe' },
            { label: 'Likely Safe', value: 'likely_safe' },
            { label: 'Unknown', value: 'unknown' },
            { label: 'Possibly Unsafe', value: 'possibly_unsafe' },
            { label: 'Unsafe', value: 'unsafe' },
          ],
        },
        {
          name: 'breastfeedingSafety',
          type: 'select',
          options: [
            { label: 'Safe', value: 'safe' },
            { label: 'Likely Safe', value: 'likely_safe' },
            { label: 'Unknown', value: 'unknown' },
            { label: 'Possibly Unsafe', value: 'possibly_unsafe' },
            { label: 'Unsafe', value: 'unsafe' },
          ],
        },
        {
          name: 'childrenSafety',
          type: 'select',
          options: [
            { label: 'Safe', value: 'safe' },
            { label: 'Likely Safe', value: 'likely_safe' },
            { label: 'Unknown', value: 'unknown' },
            { label: 'Possibly Unsafe', value: 'possibly_unsafe' },
            { label: 'Unsafe', value: 'unsafe' },
          ],
        },
      ],
    },

    // Drug Interactions
    {
      name: 'drugInteractions',
      type: 'array',
      fields: [
        {
          name: 'drugName',
          type: 'text',
          required: true,
        },
        {
          name: 'interactionType',
          type: 'select',
          options: [
            { label: 'Major', value: 'major' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Minor', value: 'minor' },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // Additional Media
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Additional images with metadata',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'partShown',
          type: 'text',
          admin: {
            description: 'Which part of the plant is shown (leaf, flower, root, etc.)',
          },
        },
        {
          name: 'photographer',
          type: 'text',
        },
        {
          name: 'license',
          type: 'text',
        },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'YouTube, Vimeo, or Facebook video URL',
          },
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Facebook', value: 'facebook' },
          ],
        },
      ],
    },

    // Relationships
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      admin: {
        description: 'Similar or related herbs',
      },
    },
    {
      name: 'substituteHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      admin: {
        description: 'Herbs that can be used as substitutes',
      },
    },
    {
      name: 'conditionsTreated',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
      admin: {
        description: 'Conditions this herb is used to treat',
      },
    },

    // Reviews & Ratings
    {
      name: 'averageRating',
      type: 'number',
      min: 0,
      max: 5,
      admin: {
        readOnly: true,
        description: 'Calculated from reviews',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      min: 0,
      admin: {
        readOnly: true,
        description: 'Total number of reviews',
      },
    },

    // Peer Review Status
    {
      name: 'peerReviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Peer Reviewed', value: 'peer_reviewed' },
        { label: 'Expert Verified', value: 'expert_verified' },
        { label: 'Published', value: 'published' },
        { label: 'Needs Update', value: 'needs_update' },
      ],
      admin: {
        description: 'Editorial and peer review status',
      },
    },

    // Search & SEO
    {
      name: 'searchTags',
      type: 'array',
      admin: {
        description: 'Tags for search optimization',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Common Name', value: 'common_name' },
            { label: 'Scientific', value: 'scientific' },
            { label: 'Condition', value: 'condition' },
            { label: 'Action', value: 'action' },
            { label: 'Part Used', value: 'part_used' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-generate slug if not provided
        if (operation === 'create' && !data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
    afterChange: [algoliaAfterChangeHook],
    afterDelete: [algoliaAfterDeleteHook],
  },
}
