import type { CollectionConfig } from 'payload/types'

export const ImportLogs: CollectionConfig = {
  slug: 'import-logs',
  labels: {
    singular: 'Import Log',
    plural: 'Import Logs',
  },
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'timestamp', 'results'],
    group: 'System',
    description: 'Logs from automated data import and sync jobs',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false,
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
        { label: 'Trefle Sync', value: 'trefle-sync' },
        { label: 'Trefle Progressive Import', value: 'trefle-progressive-import' },
        { label: 'Trefle Sync Error', value: 'trefle-sync-error' },
        { label: 'Perenual Progressive Import', value: 'perenual-progressive-import' },
        { label: 'Perenual Sync Error', value: 'perenual-sync-error' },
        { label: 'External Data Import', value: 'external-import' },
        { label: 'Algolia Sync', value: 'algolia-sync' },
        { label: 'Database Backup', value: 'database-backup' },
        { label: 'Cache Cleanup', value: 'cache-cleanup' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of import or sync operation',
      },
    },
    {
      name: 'results',
      type: 'json',
      required: true,
      admin: {
        description: 'Results data from the import/sync operation (JSON format)',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        description: 'When this log was created',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or error details',
      },
    },
  ],
  timestamps: true,
}
