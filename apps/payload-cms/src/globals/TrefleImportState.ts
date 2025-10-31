import type { GlobalConfig } from 'payload'

export const TrefleImportState: GlobalConfig = {
  slug: 'trefle-import-state',
  admin: {
    description: 'Tracks progressive import of plants from Trefle API',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'currentPage',
      type: 'number',
      defaultValue: 1,
      required: true,
      admin: {
        description: 'Current page in Trefle API pagination',
      },
    },
    {
      name: 'totalPages',
      type: 'number',
      admin: {
        description: 'Total pages available from Trefle API',
      },
    },
    {
      name: 'recordsImported',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of plants imported',
      },
    },
    {
      name: 'lastImportDate',
      type: 'date',
      admin: {
        description: 'When the last import was run',
      },
    },
    {
      name: 'importStatus',
      type: 'select',
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'not_started',
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        condition: (data) => data.importStatus === 'error',
      },
    },
    {
      name: 'lastSuccessfulPage',
      type: 'number',
      admin: {
        description: 'Last successfully imported page (for recovery)',
      },
    },
  ],
}
