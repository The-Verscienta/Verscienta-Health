import type { CollectionConfig } from 'payload'

export const GrokInsights: CollectionConfig = {
  slug: 'grok-insights',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'query', 'sessionId', 'createdAt'],
    description: 'AI-generated health insights from symptom checker',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Session identifier for grouping related queries',
      },
    },
    {
      name: 'query',
      type: 'textarea',
      required: true,
      admin: {
        description: 'User\'s symptom description or question',
      },
    },
    {
      name: 'response',
      type: 'richText',
      required: true,
      admin: {
        description: 'AI-generated response',
      },
    },
    {
      name: 'recommendations',
      type: 'array',
      admin: {
        description: 'AI recommendations',
      },
      fields: [
        {
          name: 'recommendation',
          type: 'text',
          required: true,
        },
        {
          name: 'confidence',
          type: 'number',
          min: 0,
          max: 1,
        },
      ],
    },
    {
      name: 'followUpQuestions',
      type: 'array',
      admin: {
        description: 'Suggested follow-up questions',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
      ],
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
      name: 'tokensUsed',
      type: 'number',
      admin: {
        description: 'AI tokens consumed',
        readOnly: true,
      },
    },
    {
      name: 'model',
      type: 'text',
      admin: {
        description: 'AI model used',
      },
    },
  ],
  timestamps: true,
}
