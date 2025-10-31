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
