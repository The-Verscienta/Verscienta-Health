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
