import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isPublished } from '../access/isAdmin'
import { algoliaSync } from '../hooks/algoliaSync'
import { generateSlug } from '../hooks/generateSlug'

export const Conditions: CollectionConfig = {
  slug: 'conditions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'severity', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: isPublished,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [algoliaSync('conditions')],
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Condition Name',
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
      label: 'Overview',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'symptoms',
      type: 'array',
      label: 'Common Symptoms',
      fields: [
        {
          name: 'symptom',
          type: 'text',
        },
      ],
    },
    {
      name: 'severity',
      type: 'select',
      options: [
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
        { label: 'Life-threatening', value: 'life_threatening' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Digestive', value: 'digestive' },
        { label: 'Respiratory', value: 'respiratory' },
        { label: 'Cardiovascular', value: 'cardiovascular' },
        { label: 'Musculoskeletal', value: 'musculoskeletal' },
        { label: 'Nervous System', value: 'nervous' },
        { label: 'Immune', value: 'immune' },
        { label: 'Endocrine', value: 'endocrine' },
        { label: 'Skin', value: 'skin' },
        { label: 'Mental/Emotional', value: 'mental' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tcmPattern',
      type: 'text',
      label: 'TCM Diagnostic Pattern',
      admin: {
        description: 'e.g., "Spleen Qi Deficiency", "Liver Qi Stagnation"',
      },
    },
    {
      name: 'westernDiagnosis',
      type: 'text',
      label: 'Western Medical Diagnosis',
      admin: {
        description: 'Western medical name or ICD code',
      },
    },
    {
      name: 'prevalence',
      type: 'textarea',
      label: 'Prevalence',
    },
    {
      name: 'conventionalTreatments',
      type: 'richText',
      label: 'Conventional Treatments',
    },
    {
      name: 'complementaryApproaches',
      type: 'richText',
      label: 'Complementary/Holistic Approaches',
    },
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
    },
    {
      name: 'relatedFormulas',
      type: 'relationship',
      relationTo: 'formulas',
      hasMany: true,
    },
    {
      name: 'relatedSymptoms',
      type: 'relationship',
      relationTo: 'symptoms',
      hasMany: true,
    },
    {
      name: 'preventionTips',
      type: 'richText',
      label: 'Prevention Tips',
    },
    {
      name: 'lifestyleRecommendations',
      type: 'richText',
      label: 'Lifestyle Recommendations',
    },
    {
      name: 'dietaryAdvice',
      type: 'richText',
      label: 'Dietary Advice',
    },
    {
      name: 'whenToSeekHelp',
      type: 'richText',
      label: 'When to Seek Medical Help',
      admin: {
        description: 'Red flags requiring immediate medical attention',
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
