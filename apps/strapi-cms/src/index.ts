import type { Core } from '@strapi/strapi'
import cronTasks from './cron'

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Register cron jobs
    console.log('🕐 Initializing cron jobs...')

    Object.entries(cronTasks).forEach(([schedule, task]) => {
      strapi.cron.add({
        [schedule]: task,
      })

      // Parse schedule for human-readable display
      const scheduleDesc =
        schedule === '0 3 * * 3'
          ? 'Weekly (Wed 3AM)'
          : schedule === '* * * * *'
            ? 'Every minute'
            : schedule

      console.log(`   ✓ Scheduled: ${scheduleDesc}`)
    })

    console.log('✅ Cron jobs initialized')
  },
}
