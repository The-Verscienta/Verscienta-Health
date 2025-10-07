import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'mimeType', 'filesize', 'updatedAt'],
    group: 'Admin',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1200,
        height: 900,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text (for accessibility)',
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photo Credit',
    },
    {
      name: 'license',
      type: 'select',
      label: 'License',
      options: [
        { label: 'Public Domain', value: 'public_domain' },
        { label: 'CC0', value: 'cc0' },
        { label: 'CC BY', value: 'cc_by' },
        { label: 'CC BY-SA', value: 'cc_by_sa' },
        { label: 'CC BY-NC', value: 'cc_by_nc' },
        { label: 'All Rights Reserved', value: 'all_rights_reserved' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'Tags (for organization)',
    },
  ],
  timestamps: true,
}
