import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isPublished } from '../access/isAdmin'
import { algoliaSync } from '../hooks/algoliaSync'
import { generateSlug } from '../hooks/generateSlug'

export const Formulas: CollectionConfig = {
  slug: 'formulas',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tradition', 'status', 'updatedAt'],
    group: 'Content',
    description: 'Traditional and modern herbal formulas',
  },
  access: {
    read: isPublished,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [algoliaSync('formulas')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Formula Name',
      admin: {
        description: 'e.g., "Four Gentlemen Decoction", "Relaxation Blend"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeChange: [generateSlug('title')],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Detailed Description',
      admin: {
        description: 'Historical context, traditional uses, etc.',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: 'Brief summary (1-2 sentences)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },

    // Ingredients
    {
      name: 'ingredients',
      type: 'array',
      label: 'Formula Ingredients',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'herb',
          type: 'relationship',
          relationTo: 'herbs',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          admin: {
            step: 0.01,
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
            { label: 'Teaspoons (tsp)', value: 'tsp' },
            { label: 'Tablespoons (tbsp)', value: 'tbsp' },
            { label: 'Drops', value: 'drops' },
            { label: 'Parts', value: 'parts' },
          ],
        },
        {
          name: 'percentage',
          type: 'number',
          label: 'Percentage of Formula (%)',
          admin: {
            step: 0.01,
            description: 'Auto-calculated if total weight is provided',
          },
        },
        {
          name: 'role',
          type: 'select',
          label: 'Traditional Role (TCM)',
          options: [
            { label: 'Chief Herb (Jun)', value: 'chief' },
            { label: 'Deputy Herb (Chen)', value: 'deputy' },
            { label: 'Assistant Herb (Zuo)', value: 'assistant' },
            { label: 'Envoy Herb (Shi)', value: 'envoy' },
          ],
        },
      ],
    },
    {
      name: 'totalWeight',
      type: 'number',
      label: 'Total Formula Weight',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'totalWeightUnit',
      type: 'select',
      label: 'Total Weight Unit',
      options: [
        { label: 'Grams (g)', value: 'g' },
        { label: 'Milligrams (mg)', value: 'mg' },
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Milliliters (ml)', value: 'ml' },
      ],
      admin: {
        condition: (data) => !!data.totalWeight,
      },
    },

    // Preparation & Dosage
    {
      name: 'preparationInstructions',
      type: 'richText',
      label: 'Preparation Instructions',
    },
    {
      name: 'dosage',
      type: 'richText',
      label: 'Dosage Instructions',
    },

    // Use Cases
    {
      name: 'useCases',
      type: 'array',
      label: 'Use Cases',
      fields: [
        {
          name: 'useCase',
          type: 'text',
        },
      ],
    },
    {
      name: 'relatedConditions',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
      label: 'Related Conditions',
    },

    // Tradition & Category
    {
      name: 'tradition',
      type: 'select',
      options: [
        { label: 'Traditional Chinese Medicine', value: 'tcm' },
        { label: 'Ayurveda', value: 'ayurveda' },
        { label: 'Western Herbalism', value: 'western' },
        { label: 'Native American', value: 'native_american' },
        { label: 'Modern', value: 'modern' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      admin: {
        description: 'e.g., "Qi Tonifying", "Blood Nourishing"',
      },
    },
    {
      name: 'historicalText',
      type: 'text',
      label: 'Source Text',
      admin: {
        description: 'e.g., "Shang Han Lun", "Bencao Gangmu"',
      },
    },
    {
      name: 'modernAdaptations',
      type: 'richText',
      label: 'Modern Adaptations',
    },

    // Safety
    {
      name: 'contraindications',
      type: 'richText',
      label: 'Contraindications',
    },
    {
      name: 'sideEffects',
      type: 'richText',
      label: 'Potential Side Effects',
    },

    // Status
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
