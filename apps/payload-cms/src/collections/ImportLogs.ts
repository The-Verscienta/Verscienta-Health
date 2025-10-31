import type { CollectionConfig } from 'payload'

export const ImportLogs: CollectionConfig = {
  slug: 'import-logs',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'status', 'recordsProcessed', 'duration', 'timestamp'],
    description: 'Logs from automated data import and sync jobs',
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
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Trefle Sync', value: 'trefle-sync' },
        { label: 'Trefle Progressive Import', value: 'trefle-progressive-import' },
        { label: 'Trefle Sync Error', value: 'trefle-sync-error' },
        { label: 'Perenual Progressive Import', value: 'perenual-progressive-import' },
        { label: 'Perenual Sync Error', value: 'perenual-sync-error' },
        { label: 'External Import', value: 'external-import' },
        { label: 'Algolia Sync', value: 'algolia-sync' },
        { label: 'Database Backup', value: 'database-backup' },
        { label: 'Cache Cleanup', value: 'cache-cleanup' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Source system or API',
      },
    },
    {
      name: 'status',
      type: 'select',
      index: true,
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'In Progress', value: 'in_progress' },
      ],
    },

    // Performance Metrics
    {
      name: 'recordsProcessed',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total records processed',
      },
    },
    {
      name: 'recordsCreated',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'recordsUpdated',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'recordsFailed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Duration in milliseconds',
      },
    },

    // Details
    {
      name: 'summary',
      type: 'json',
      admin: {
        description: 'Summary of import operation',
      },
    },
    {
      name: 'errors',
      type: 'json',
      admin: {
        description: 'Error details if failed',
      },
    },
    {
      name: 'results',
      type: 'json',
      admin: {
        description: 'Detailed results',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'When the import was executed',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
