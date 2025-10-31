import type { CollectionConfig } from 'payload'
import { algoliaAfterChangeHook, algoliaAfterDeleteHook } from '../hooks/algolia-sync'

export const Practitioners: CollectionConfig = {
  slug: 'practitioners',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'practitionerName', 'verificationStatus', 'city', 'state'],
    description: 'Verified practitioner directory',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      admin: {
        description: 'Linked user account',
      },
    },
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'practitionerName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    // Credentials
    {
      name: 'credentials',
      type: 'array',
      admin: {
        description: 'Professional certifications and licenses',
      },
      fields: [
        {
          name: 'credentialType',
          type: 'text',
          required: true,
        },
        {
          name: 'credentialNumber',
          type: 'text',
        },
        {
          name: 'issuingOrganization',
          type: 'text',
        },
        {
          name: 'issueDate',
          type: 'date',
        },
        {
          name: 'expiryDate',
          type: 'date',
        },
      ],
    },

    // Specialties
    {
      name: 'specialties',
      type: 'array',
      fields: [
        {
          name: 'specialty',
          type: 'text',
          required: true,
        },
      ],
    },

    // Languages
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
        {
          name: 'proficiency',
          type: 'select',
          options: [
            { label: 'Native', value: 'native' },
            { label: 'Fluent', value: 'fluent' },
            { label: 'Conversational', value: 'conversational' },
          ],
        },
      ],
    },

    // Address
    {
      name: 'addresses',
      type: 'array',
      fields: [
        {
          name: 'addressType',
          type: 'select',
          options: [
            { label: 'Primary Office', value: 'primary' },
            { label: 'Secondary Office', value: 'secondary' },
            { label: 'Clinic', value: 'clinic' },
          ],
        },
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'zipCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'USA',
        },
        {
          name: 'latitude',
          type: 'number',
        },
        {
          name: 'longitude',
          type: 'number',
        },
      ],
    },

    // Insurance
    {
      name: 'insuranceProviders',
      type: 'array',
      fields: [
        {
          name: 'provider',
          type: 'text',
          required: true,
        },
      ],
    },

    // Pricing
    {
      name: 'pricing',
      type: 'array',
      fields: [
        {
          name: 'serviceType',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Duration in minutes',
          },
        },
      ],
    },

    // Contact
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },

    // Relationships
    {
      name: 'modalities',
      type: 'relationship',
      relationTo: 'modalities',
      hasMany: true,
    },

    // Verification
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'verificationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.verificationStatus !== 'pending',
      },
    },

    // Reviews
    {
      name: 'averageRating',
      type: 'number',
      min: 0,
      max: 5,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      min: 0,
      admin: {
        readOnly: true,
      },
    },

    // Extracted city/state for easier filtering
    {
      name: 'city',
      type: 'text',
      admin: {
        description: 'Primary city (auto-populated from addresses)',
        readOnly: true,
      },
    },
    {
      name: 'state',
      type: 'text',
      admin: {
        description: 'Primary state (auto-populated from addresses)',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-populate city/state from first address
        if (data.addresses && data.addresses.length > 0) {
          data.city = data.addresses[0].city
          data.state = data.addresses[0].state
        }
        return data
      },
    ],
    afterChange: [algoliaAfterChangeHook],
    afterDelete: [algoliaAfterDeleteHook],
  },
}
