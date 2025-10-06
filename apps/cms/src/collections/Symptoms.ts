import type { CollectionConfig } from 'payload/types'
import { isAdminOrEditor, isPublished } from '../access/isAdmin'
import { generateSlug } from '../hooks/generateSlug'

export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: isPublished,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [generateSlug('title')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Symptom Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Physical', value: 'physical' },
        { label: 'Mental/Emotional', value: 'mental' },
        { label: 'Digestive', value: 'digestive' },
        { label: 'Respiratory', value: 'respiratory' },
        { label: 'Pain', value: 'pain' },
        { label: 'Skin', value: 'skin' },
        { label: 'Sleep', value: 'sleep' },
        { label: 'Energy', value: 'energy' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'severity',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
      ],
    },
    {
      name: 'duration',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Acute (<1 week)', value: 'acute' },
        { label: 'Subacute (1-4 weeks)', value: 'subacute' },
        { label: 'Chronic (>4 weeks)', value: 'chronic' },
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
    },
    {
      name: 'tcmInterpretation',
      type: 'richText',
      label: 'TCM Interpretation',
    },
    {
      name: 'westernInterpretation',
      type: 'richText',
      label: 'Western Medical Interpretation',
    },
    {
      name: 'redFlags',
      type: 'richText',
      label: 'Red Flags (Emergency Signs)',
      admin: {
        description: 'When this symptom indicates need for immediate medical attention',
      },
    },
    {
      name: 'commonCauses',
      type: 'array',
      label: 'Common Causes',
      fields: [
        {
          name: 'cause',
          type: 'text',
        },
      ],
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
