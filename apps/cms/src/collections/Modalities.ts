import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isPublished } from '../access/isAdmin'
import { generateSlug } from '../hooks/generateSlug'

export const Modalities: CollectionConfig = {
  slug: 'modalities',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: isPublished,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Modality Name',
      admin: {
        description: 'e.g., "Traditional Chinese Medicine", "Ayurveda"',
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
      label: 'What is this modality?',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'history',
      type: 'richText',
      label: 'Historical Background',
    },
    {
      name: 'principles',
      type: 'richText',
      label: 'Core Principles & Philosophy',
    },
    {
      name: 'diagnosticMethods',
      type: 'richText',
      label: 'Diagnostic Methods',
      admin: {
        description: 'How practitioners assess patients',
      },
    },
    {
      name: 'treatmentModalities',
      type: 'array',
      label: 'Treatment Approaches',
      fields: [
        {
          name: 'approach',
          type: 'text',
          admin: {
            description: 'e.g., "Acupuncture", "Herbal Medicine", "Massage"',
          },
        },
      ],
    },
    {
      name: 'excelsAt',
      type: 'array',
      label: 'Conditions This Modality Excels At',
      fields: [
        {
          name: 'condition',
          type: 'text',
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      label: 'Key Benefits',
      fields: [
        {
          name: 'benefit',
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
        description: 'Herbs commonly used in this modality',
      },
    },
    {
      name: 'trainingRequirements',
      type: 'richText',
      label: 'Training Requirements',
      admin: {
        description: 'How to become a practitioner',
      },
    },
    {
      name: 'certificationBodies',
      type: 'array',
      label: 'Certification Bodies',
      fields: [
        {
          name: 'organization',
          type: 'text',
        },
      ],
    },
    {
      name: 'researchEvidence',
      type: 'richText',
      label: 'Scientific Research & Evidence',
    },
    {
      name: 'safetyConsiderations',
      type: 'richText',
      label: 'Safety Considerations',
    },
    {
      name: 'typicalSession',
      type: 'richText',
      label: 'What to Expect in a Session',
    },
    {
      name: 'costRange',
      type: 'text',
      label: 'Typical Cost Range',
      admin: {
        description: 'e.g., "$75-$150 per session"',
      },
    },
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
