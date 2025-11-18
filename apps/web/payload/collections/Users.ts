import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf, isPublic } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role'],
  },
  access: {
    read: isPublic,
    create: ({ req: { user } }) => {
      // Allow anyone to create the first user (admin)
      if (!user) return true
      // After that, only admins can create users
      return user.role === 'admin'
    },
    update: isAdminOrSelf, // Users can update themselves, admins can update anyone
    delete: isAdmin, // Only admins can delete users
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
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Practitioner',
          value: 'practitioner',
        },
        {
          label: 'Herbalist',
          value: 'herbalist',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'betterAuthId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Linked Better Auth user ID for authentication sync',
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
            { label: '中文 (Simplified)', value: 'zh-CN' },
            { label: '中文 (Traditional)', value: 'zh-TW' },
          ],
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
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
      ],
    },
  ],
  timestamps: true,
}
