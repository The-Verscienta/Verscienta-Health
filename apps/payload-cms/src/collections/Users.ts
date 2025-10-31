import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      // Allow anyone to create the first user (admin)
      if (!user) return true
      // After that, only admins can create users
      return user.role === 'admin'
    },
    update: ({ req: { user } }) => {
      // Users can update themselves, admins can update anyone
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete users
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
        {
          label: 'Public',
          value: 'public',
        },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'dateOfBirth',
      type: 'date',
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'language',
          type: 'select',
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
            { label: 'Français', value: 'fr' },
            { label: '中文', value: 'zh' },
          ],
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
}
