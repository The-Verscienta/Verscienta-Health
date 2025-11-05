import type { CollectionConfig } from 'payload'

export const ValidationReports: CollectionConfig = {
  slug: 'validation-reports',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'collectionType', 'severity', 'errorCount', 'warningCount', 'timestamp'],
    description: 'Data validation reports from automated quality checks',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => true, // System-level creation
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  versions: false,
  timestamps: true,
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Type of validation check',
      },
    },
    {
      name: 'collectionType',
      type: 'text',
      index: true,
      admin: {
        description: 'Collection being validated (herbs, formulas, etc.)',
      },
    },
    {
      name: 'documentId',
      type: 'text',
      index: true,
      admin: {
        description: 'Specific document ID if applicable',
      },
    },
    {
      name: 'field',
      type: 'text',
      admin: {
        description: 'Specific field with validation issues',
      },
    },
    {
      name: 'currentValue',
      type: 'text',
      admin: {
        description: 'Current value in database',
      },
    },
    {
      name: 'suggestedValue',
      type: 'text',
      admin: {
        description: 'Suggested corrected value',
      },
    },
    {
      name: 'severity',
      type: 'select',
      defaultValue: 'warning',
      index: true,
      options: [
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Validation message or description',
      },
    },
    {
      name: 'issues',
      type: 'array',
      admin: {
        description: 'Individual validation issues found',
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
        },
        {
          name: 'issue',
          type: 'text',
          required: true,
        },
        {
          name: 'severity',
          type: 'select',
          options: [
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warning' },
            { label: 'Info', value: 'info' },
          ],
        },
      ],
    },
    {
      name: 'errorCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of errors found',
      },
    },
    {
      name: 'warningCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of warnings found',
      },
    },
    {
      name: 'totalChecked',
      type: 'number',
      admin: {
        description: 'Total records checked',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'When validation was run',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
