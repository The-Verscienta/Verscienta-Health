import type { CollectionConfig } from 'payload/types'

export const GrokInsights: CollectionConfig = {
  slug: 'grok-insights',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins can see all
      if (user?.role === 'admin') return true

      // Users can only see their own insights
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }

      return false
    },
    create: () => true, // API can create
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // Users can delete their own insights
      return {
        user: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Summary Title',
      admin: {
        description: 'Auto-generated summary of the insight',
      },
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
      name: 'input',
      type: 'json',
      label: 'User Input',
      admin: {
        description: 'Original symptom/question data',
      },
    },
    {
      name: 'analysis',
      type: 'richText',
      label: 'AI Analysis',
    },
    {
      name: 'recommendations',
      type: 'array',
      label: 'Recommendations',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Herb', value: 'herb' },
            { label: 'Formula', value: 'formula' },
            { label: 'Modality', value: 'modality' },
            { label: 'Practitioner', value: 'practitioner' },
            { label: 'Lifestyle', value: 'lifestyle' },
          ],
        },
        {
          name: 'entityId',
          type: 'text',
          label: 'Entity ID',
          admin: {
            description: 'ID of the recommended item (if applicable)',
          },
        },
        {
          name: 'reasoning',
          type: 'textarea',
          label: 'Why This Recommendation',
        },
        {
          name: 'confidence',
          type: 'number',
          label: 'Confidence Score (0-100)',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      name: 'followUpQuestions',
      type: 'array',
      label: 'Follow-up Questions',
      fields: [
        {
          name: 'question',
          type: 'text',
        },
      ],
    },
    {
      name: 'disclaimers',
      type: 'richText',
      label: 'Medical Disclaimers',
      admin: {
        description: 'Auto-added standard medical disclaimers',
      },
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
      name: 'sessionId',
      type: 'text',
      label: 'Session ID',
      admin: {
        description: 'To group multi-turn conversations',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'User',
      admin: {
        description: 'User who requested this analysis (if logged in)',
      },
    },
    {
      name: 'grokModel',
      type: 'text',
      label: 'Grok Model Used',
      defaultValue: 'grok-beta',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tokensUsed',
      type: 'number',
      label: 'Tokens Used',
      admin: {
        readOnly: true,
        description: 'For cost tracking',
      },
    },
  ],
  timestamps: true,
}
