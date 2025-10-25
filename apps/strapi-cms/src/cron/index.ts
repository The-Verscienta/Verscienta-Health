/**
 * Cron Job Scheduler
 *
 * Orchestrates all automated background jobs for Verscienta Health.
 *
 * Schedule Format (cron syntax):
 * minute (0 - 59)
 * hour (0 - 23)
 * day of month (1 - 31)
 * month (1 - 12)
 * day of week (0 - 6) (Sunday to Saturday)
 *
 * Examples:
 * - '0 3 * * 3' = Every Wednesday at 3:00 AM
 * - '* * * * *' = Every minute
 * - '0 0 * * *' = Every day at midnight
 */

import type { Core } from '@strapi/strapi'
// import importTrefleData from './jobs/importTrefleData'
import syncTrefleData from './jobs/syncTrefleData'

export default {
  /**
   * Sync Trefle Botanical Data
   * Runs: Every Wednesday at 3:00 AM
   * Purpose: Enrich existing herbs with botanical data
   * Conditions: TREFLE_API_KEY must be set
   */
  '0 3 * * 3': async ({ strapi }: { strapi: Core.Strapi }) => {
    if (process.env.TREFLE_API_KEY) {
      await syncTrefleData({ strapi })
    }
  },

  /**
   * Import Trefle Plant Database (Progressive)
   * Runs: Every minute
   * Purpose: Import all Trefle plants as draft herbs
   * Conditions: TREFLE_API_KEY and ENABLE_TREFLE_IMPORT=true must be set
   *
   * WARNING: Only enable if you want to import 1M+ plants
   * NOTE: Temporarily disabled - importTrefleData.ts needs to be created
   */
  // '* * * * *': async ({ strapi }: { strapi: Core.Strapi }) => {
  //   if (process.env.TREFLE_API_KEY && process.env.ENABLE_TREFLE_IMPORT === 'true') {
  //     await importTrefleData({ strapi })
  //   }
  // },

  // Additional cron jobs can be added here
  // Example:
  // '0 0 * * *': async ({ strapi }) => {
  //   // Daily cleanup job
  //   console.log('Running daily cleanup...')
  // },
}
