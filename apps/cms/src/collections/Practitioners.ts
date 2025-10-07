import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdmin'
import { generateSlug } from '../hooks/generateSlug'
import { geocodeAddress } from '../hooks/geocodeAddress'

export const Practitioners: CollectionConfig = {
  slug: 'practitioners',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'verificationStatus', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'editor') return true
      // Practitioners can edit their own profile
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [geocodeAddress],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeChange: [generateSlug('name')],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Full URL including https://',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Professional Biography',
    },
    {
      name: 'credentials',
      type: 'array',
      label: 'Credentials & Certifications',
      fields: [
        {
          name: 'credential',
          type: 'text',
          admin: {
            description: 'e.g., "L.Ac.", "MSOM", "RH (AHG)"',
          },
        },
      ],
    },
    {
      name: 'yearsExperience',
      type: 'number',
      label: 'Years of Experience',
    },
    {
      name: 'practiceType',
      type: 'select',
      options: [
        { label: 'Solo Practice', value: 'solo' },
        { label: 'Group Practice', value: 'group' },
        { label: 'Clinic', value: 'clinic' },
        { label: 'Hospital', value: 'hospital' },
        { label: 'Online Only', value: 'online' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'modalities',
      type: 'relationship',
      relationTo: 'modalities',
      hasMany: true,
      required: true,
    },
    {
      name: 'specialties',
      type: 'array',
      label: 'Areas of Specialty',
      fields: [
        {
          name: 'specialty',
          type: 'text',
        },
      ],
    },
    {
      name: 'languagesSpoken',
      type: 'array',
      label: 'Languages Spoken',
      fields: [
        {
          name: 'language',
          type: 'text',
        },
      ],
    },

    // Address
    {
      name: 'address',
      type: 'group',
      fields: [
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
          label: 'State/Province',
        },
        {
          name: 'zipCode',
          type: 'text',
          label: 'ZIP/Postal Code',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'United States',
        },
        {
          name: 'latitude',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Auto-geocoded',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Auto-geocoded',
          },
        },
      ],
    },
    {
      name: 'serviceArea',
      type: 'text',
      label: 'Service Area',
      admin: {
        description: 'e.g., "50 mile radius", "California only"',
      },
    },

    // Insurance & Pricing
    {
      name: 'acceptsInsurance',
      type: 'checkbox',
      label: 'Accepts Insurance',
    },
    {
      name: 'insuranceProviders',
      type: 'array',
      label: 'Insurance Providers Accepted',
      admin: {
        condition: (data) => data.acceptsInsurance,
      },
      fields: [
        {
          name: 'provider',
          type: 'text',
        },
      ],
    },
    {
      name: 'offersVirtualConsults',
      type: 'checkbox',
      label: 'Offers Virtual Consultations',
    },
    {
      name: 'bookingUrl',
      type: 'text',
      label: 'Online Booking URL',
      admin: {
        description: 'Link to online booking system',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Pricing Information',
      fields: [
        {
          name: 'initialConsult',
          type: 'number',
          label: 'Initial Consultation Price',
          admin: {
            description: 'In USD',
          },
        },
        {
          name: 'followUp',
          type: 'number',
          label: 'Follow-up Visit Price',
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'CAD', value: 'CAD' },
            { label: 'AUD', value: 'AUD' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Additional Pricing Notes',
        },
      ],
    },
    {
      name: 'availability',
      type: 'richText',
      label: 'General Availability',
      admin: {
        description: 'e.g., "Monday-Friday, 9am-5pm"',
      },
    },
    {
      name: 'treatmentApproach',
      type: 'richText',
      label: 'Treatment Philosophy & Approach',
    },

    // Verification & Status
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Verification', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'verifiedDate',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Practitioner',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'averageRating',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-calculated from reviews',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Associated User Account',
      admin: {
        position: 'sidebar',
        description: 'Link to user account if practitioner has one',
      },
    },
  ],
  timestamps: true,
}
