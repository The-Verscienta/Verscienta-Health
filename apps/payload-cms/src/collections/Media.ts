import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alt text for accessibility',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'photographer',
      type: 'text',
    },
    {
      name: 'license',
      type: 'select',
      options: [
        { label: 'All Rights Reserved', value: 'all_rights_reserved' },
        { label: 'Public Domain', value: 'public_domain' },
        { label: 'CC BY 4.0', value: 'cc_by_4' },
        { label: 'CC BY-SA 4.0', value: 'cc_by_sa_4' },
        { label: 'CC BY-NC 4.0', value: 'cc_by_nc_4' },
        { label: 'CC BY-ND 4.0', value: 'cc_by_nd_4' },
        { label: 'CC0 1.0', value: 'cc0_1' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Source or attribution URL',
      },
    },
  ],
  timestamps: true,
}
