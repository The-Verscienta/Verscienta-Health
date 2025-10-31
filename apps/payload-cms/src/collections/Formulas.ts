import type { CollectionConfig } from 'payload'

export const Formulas: CollectionConfig = {
  slug: 'formulas',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tradition', 'updatedAt'],
    description: 'Traditional and modern herbal formulas',
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
    // Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Formula name',
      },
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
      name: 'shortDescription',
      type: 'textarea',
      admin: {
        description: 'Brief summary for listings',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Full description and usage information',
      },
    },

    // Media
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },

    // Ingredients (array with herb relation)
    {
      name: 'ingredients',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Herbs in this formula',
      },
      fields: [
        {
          name: 'herb',
          type: 'relationship',
          relationTo: 'herbs',
          required: true,
          admin: {
            description: 'Select the herb ingredient',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Amount of this herb',
          },
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          options: [
            { label: 'Grams (g)', value: 'g' },
            { label: 'Milligrams (mg)', value: 'mg' },
            { label: 'Ounces (oz)', value: 'oz' },
            { label: 'Milliliters (ml)', value: 'ml' },
            { label: 'Teaspoon (tsp)', value: 'tsp' },
            { label: 'Tablespoon (tbsp)', value: 'tbsp' },
            { label: 'Drops', value: 'drops' },
            { label: 'Parts', value: 'parts' },
          ],
        },
        {
          name: 'percentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Percentage of total formula',
          },
        },
        {
          name: 'role',
          type: 'select',
          admin: {
            description: 'TCM formula role',
          },
          options: [
            { label: 'Chief (君药)', value: 'chief' },
            { label: 'Deputy (臣药)', value: 'deputy' },
            { label: 'Assistant (佐药)', value: 'assistant' },
            { label: 'Envoy (使药)', value: 'envoy' },
          ],
        },
      ],
    },

    // Total Weight
    {
      name: 'totalWeight',
      type: 'number',
      min: 0,
      admin: {
        description: 'Total weight/volume of the formula',
      },
    },
    {
      name: 'totalWeightUnit',
      type: 'select',
      options: [
        { label: 'Grams (g)', value: 'g' },
        { label: 'Milligrams (mg)', value: 'mg' },
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Milliliters (ml)', value: 'ml' },
      ],
    },

    // Preparation & Dosage
    {
      name: 'preparationInstructions',
      type: 'richText',
      admin: {
        description: 'How to prepare the formula',
      },
    },
    {
      name: 'dosage',
      type: 'richText',
      admin: {
        description: 'Recommended dosage and administration',
      },
    },

    // Use Cases
    {
      name: 'useCases',
      type: 'array',
      admin: {
        description: 'Traditional and modern use cases',
      },
      fields: [
        {
          name: 'useCase',
          type: 'text',
          required: true,
        },
      ],
    },

    // Relationships
    {
      name: 'relatedConditions',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
      admin: {
        description: 'Conditions this formula is used to treat',
      },
    },

    // Classification
    {
      name: 'tradition',
      type: 'select',
      options: [
        { label: 'Traditional Chinese Medicine (TCM)', value: 'tcm' },
        { label: 'Ayurveda', value: 'ayurveda' },
        { label: 'Western Herbalism', value: 'western' },
        { label: 'Native American', value: 'native_american' },
        { label: 'Modern', value: 'modern' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Traditional system this formula belongs to',
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Formula category (e.g., "Tonify Qi", "Clear Heat")',
      },
    },

    // Historical & Modern Context
    {
      name: 'historicalText',
      type: 'text',
      admin: {
        description: 'Original source text or historical reference',
      },
    },
    {
      name: 'modernAdaptations',
      type: 'richText',
      admin: {
        description: 'Modern variations and adaptations of this formula',
      },
    },

    // Safety Information
    {
      name: 'contraindications',
      type: 'richText',
      admin: {
        description: 'When this formula should not be used',
      },
    },
    {
      name: 'sideEffects',
      type: 'richText',
      admin: {
        description: 'Potential side effects',
      },
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
  },
}
