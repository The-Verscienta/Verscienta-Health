// Temporarily disable Sentry in production due to standalone build compatibility issues
// TODO: Re-enable when Sentry + Next.js standalone + pnpm issue is resolved
if (process.env.NODE_ENV === 'development') {
  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Adjust this value in production, or use tracesSampler for greater control
        tracesSampleRate: 1,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: false,

        replaysOnErrorSampleRate: 1.0,

        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,

        // You can remove this option if you're not planning to use the Sentry Session Replay feature:
        integrations: [
          Sentry.replayIntegration({
            // Additional Replay configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

        environment: process.env.NODE_ENV,
      })
    })
    .catch((error) => {
      console.warn('Sentry client initialization failed:', error)
    })
}

// Export hook to instrument router transitions (no-op in production for now)
export const onRouterTransitionStart = () => {}
