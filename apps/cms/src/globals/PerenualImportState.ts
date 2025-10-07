import type { GlobalConfig } from 'payload/types'

export const PerenualImportState: GlobalConfig = {
  slug: 'perenual-import-state',
  label: 'Perenual Import State',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'currentPage',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'Current page being imported from Perenual API',
      },
    },
    {
      name: 'isComplete',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the import has completed all pages',
      },
    },
    {
      name: 'lastRunAt',
      type: 'date',
      admin: {
        description: 'Last time the import job ran',
      },
    },
    {
      name: 'lastCompletedAt',
      type: 'date',
      admin: {
        description: 'Last time the import completed all pages',
      },
    },
    {
      name: 'totalPlantsImported',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of plants imported so far',
      },
    },
    {
      name: 'totalHerbsCreated',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of new herbs created',
      },
    },
    {
      name: 'totalHerbsUpdated',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of existing herbs updated',
      },
    },
  ],
  admin: {
    group: 'System',
    description: 'Tracks the progress of importing plant data from Perenual API',
  },
}
