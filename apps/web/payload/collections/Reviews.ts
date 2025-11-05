import type { CollectionConfig } from 'payload'
import { isPublic, isAuthenticated, isAdmin, isOwnReview } from '../access'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'reviewedEntityType', 'moderationStatus', 'createdAt'],
    description: 'User reviews for herbs, formulas, practitioners, and modalities',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isOwnReview, // Users can only update their own reviews
    delete: isAdmin, // Only admins can delete reviews
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
    {
      name: 'reviewedEntity',
      type: 'relationship',
      relationTo: ['herbs', 'formulas', 'practitioners', 'modalities'],
      required: true,
      admin: {
        description: 'Select the item being reviewed',
      },
    },
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
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.moderationStatus !== 'pending',
      },
    },
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
        if (data.reviewedEntity && typeof data.reviewedEntity === 'object') {
          const entityTypeMap = {
            herbs: 'herb',
            formulas: 'formula',
            practitioners: 'practitioner',
            modalities: 'modality',
          }
          data.reviewedEntityType = entityTypeMap[data.reviewedEntity.relationTo as keyof typeof entityTypeMap]
        }
        return data
      },
    ],
  },
}
