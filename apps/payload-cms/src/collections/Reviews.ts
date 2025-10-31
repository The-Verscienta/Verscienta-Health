import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'reviewedEntityType', 'moderationStatus', 'createdAt'],
    description: 'User reviews for herbs, formulas, practitioners, and modalities',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },

    // Polymorphic relationship - Payload supports this with relationTo array
    {
      name: 'reviewedEntity',
      type: 'relationship',
      relationTo: ['herbs', 'formulas', 'practitioners', 'modalities'],
      required: true,
      admin: {
        description: 'Select the item being reviewed',
      },
    },

    // Store the type for easier querying
    {
      name: 'reviewedEntityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Herb', value: 'herb' },
        { label: 'Formula', value: 'formula' },
        { label: 'Practitioner', value: 'practitioner' },
        { label: 'Modality', value: 'modality' },
      ],
      admin: {
        description: 'Auto-populated based on reviewedEntity',
      },
    },

    // Author
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },

    // Moderation
    {
      name: 'moderationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Flagged', value: 'flagged' },
      ],
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.moderationStatus !== 'pending',
      },
    },

    // Helpfulness
    {
      name: 'helpfulCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notHelpfulCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-populate reviewedEntityType based on reviewedEntity
        if (data.reviewedEntity && typeof data.reviewedEntity === 'object') {
          const entityTypeMap = {
            herbs: 'herb',
            formulas: 'formula',
            practitioners: 'practitioner',
            modalities: 'modality',
          }
          data.reviewedEntityType = entityTypeMap[data.reviewedEntity.relationTo]
        }
        return data
      },
    ],
  },
}
