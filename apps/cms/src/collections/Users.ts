import type { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'emailVerified'],
    group: 'Admin',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Peer Reviewer', value: 'peer_reviewer' },
        { label: 'Herbalist', value: 'herbalist' },
        { label: 'Practitioner', value: 'practitioner' },
        { label: 'User', value: 'user' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Image',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      label: 'Preferences',
      fields: [
        {
          name: 'language',
          type: 'select',
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'Simplified Chinese', value: 'zh-CN' },
            { label: 'Traditional Chinese', value: 'zh-TW' },
          ],
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'system',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
          ],
        },
        {
          name: 'newsletter',
          type: 'checkbox',
          defaultValue: false,
          label: 'Subscribe to Newsletter',
        },
      ],
    },
    {
      name: 'savedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      label: 'Saved Herbs',
    },
    {
      name: 'savedFormulas',
      type: 'relationship',
      relationTo: 'formulas',
      hasMany: true,
      label: 'Saved Formulas',
    },
    {
      name: 'savedPractitioners',
      type: 'relationship',
      relationTo: 'practitioners',
      hasMany: true,
      label: 'Saved Practitioners',
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
