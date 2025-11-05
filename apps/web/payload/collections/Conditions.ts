import type { CollectionConfig } from 'payload'
import { algoliaAfterChangeHook, algoliaAfterDeleteHook } from '../hooks/algolia-sync'
import { isPublic, isAuthenticated, isAdmin } from '../access'

export const Conditions: CollectionConfig = {
  slug: 'conditions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'severity', 'updatedAt'],
    description: 'Health conditions and ailments',
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
      name: 'symptoms',
      type: 'array',
      admin: {
        description: 'Symptoms associated with this condition',
      },
      fields: [
        {
          name: 'symptom',
          type: 'text',
          required: true,
        },
        {
          name: 'frequency',
          type: 'select',
          options: [
            { label: 'Common', value: 'common' },
            { label: 'Occasional', value: 'occasional' },
            { label: 'Rare', value: 'rare' },
          ],
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
        { label: 'Life Threatening', value: 'life_threatening' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Digestive', value: 'digestive' },
        { label: 'Respiratory', value: 'respiratory' },
        { label: 'Cardiovascular', value: 'cardiovascular' },
        { label: 'Musculoskeletal', value: 'musculoskeletal' },
        { label: 'Nervous', value: 'nervous' },
        { label: 'Immune', value: 'immune' },
        { label: 'Endocrine', value: 'endocrine' },
        { label: 'Skin', value: 'skin' },
        { label: 'Mental', value: 'mental' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'tcmPattern',
      type: 'text',
      admin: {
        description: 'TCM pattern differentiation',
      },
    },
    {
      name: 'westernDiagnosis',
      type: 'text',
      admin: {
        description: 'Western medicine diagnosis',
      },
    },
    {
      name: 'prevalence',
      type: 'textarea',
      admin: {
        description: 'How common this condition is',
      },
    },
    {
      name: 'conventionalTreatments',
      type: 'richText',
    },
    {
      name: 'complementaryApproaches',
      type: 'richText',
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
    },
    {
      name: 'lifestyleRecommendations',
      type: 'richText',
    },
    {
      name: 'dietaryAdvice',
      type: 'richText',
    },
    {
      name: 'whenToSeekHelp',
      type: 'richText',
      admin: {
        description: 'Red flags and when to see a healthcare provider',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [algoliaAfterChangeHook],
    afterDelete: [algoliaAfterDeleteHook],
  },
}
