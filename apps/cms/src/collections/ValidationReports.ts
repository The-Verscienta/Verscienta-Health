import type { CollectionConfig } from 'payload'

export const ValidationReports: CollectionConfig = {
  slug: 'validation-reports',
  labels: {
    singular: 'Validation Report',
    plural: 'Validation Reports',
  },
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'timestamp', 'errorCount', 'warningCount'],
    group: 'System',
    description: 'Data validation reports from automated quality checks',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'editor'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Herb Data Validation', value: 'herb-validation' },
        { label: 'Trefle Name Mismatch', value: 'trefle-name-mismatch' },
        { label: 'Formula Validation', value: 'formula-validation' },
        { label: 'Image Validation', value: 'image-validation' },
        { label: 'Scientific Name Validation', value: 'scientific-name-validation' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of validation report',
      },
    },
    {
      name: 'issues',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'herbId',
          type: 'text',
          admin: {
            description: 'ID of the herb with the issue',
          },
        },
        {
          name: 'herbName',
          type: 'text',
          admin: {
            description: 'Name of the herb with the issue',
          },
        },
        {
          name: 'field',
          type: 'text',
          admin: {
            description: 'Field name that has the issue',
          },
        },
        {
          name: 'issue',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Description of the issue',
          },
        },
        {
          name: 'severity',
          type: 'select',
          required: true,
          options: [
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warning' },
            { label: 'Info', value: 'info' },
          ],
          defaultValue: 'warning',
        },
        {
          name: 'resolved',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this issue has been resolved',
          },
        },
        {
          name: 'resolvedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'User who resolved this issue',
          },
        },
        {
          name: 'resolvedAt',
          type: 'date',
          admin: {
            description: 'When this issue was resolved',
          },
        },
      ],
      admin: {
        description: 'List of validation issues found',
      },
    },
    {
      name: 'errorCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Total number of errors in this report',
      },
    },
    {
      name: 'warningCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Total number of warnings in this report',
      },
    },
    {
      name: 'totalChecked',
      type: 'number',
      required: true,
      admin: {
        description: 'Total number of items checked',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        description: 'When this validation was performed',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this validation',
      },
    },
  ],
  timestamps: true,
}
