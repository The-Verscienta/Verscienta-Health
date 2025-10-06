import type { CollectionConfig } from 'payload/types'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'reviewedEntityType', 'moderationStatus', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins and moderators see all
      if (user?.role === 'admin' || user?.role === 'peer_reviewer') return true

      // Others only see approved reviews
      return {
        moderationStatus: {
          equals: 'approved',
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'peer_reviewer') return true

      // Users can edit their own reviews
      return {
        author: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        author: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        step: 1,
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Review Title',
      admin: {
        description: 'Optional short title for the review',
      },
    },
    {
      name: 'comment',
      type: 'richText',
      required: true,
      label: 'Review Comment',
    },
    {
      name: 'reviewedEntityType',
      type: 'select',
      required: true,
      label: 'What are you reviewing?',
      options: [
        { label: 'Herb', value: 'herb' },
        { label: 'Formula', value: 'formula' },
        { label: 'Practitioner', value: 'practitioner' },
        { label: 'Modality', value: 'modality' },
      ],
    },
    {
      name: 'reviewedEntityId',
      type: 'text',
      required: true,
      label: 'Entity ID',
      admin: {
        description: 'ID of the herb, formula, practitioner, or modality being reviewed',
      },
    },
    {
      name: 'helpful',
      type: 'number',
      defaultValue: 0,
      label: 'Helpful Votes',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: 'Verified Purchase/Visit',
      defaultValue: false,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Display Name',
      admin: {
        description: 'How the author name appears publicly',
      },
    },
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'moderatorNotes',
      type: 'textarea',
      label: 'Moderator Notes',
      admin: {
        condition: (data) => data.moderationStatus !== 'approved',
      },
    },
  ],
  timestamps: true,
}
