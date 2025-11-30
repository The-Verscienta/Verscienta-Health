export async function register() {
  // Temporarily disable Sentry in production due to standalone build compatibility issues
  // TODO: Re-enable when Sentry + Next.js standalone + pnpm issue is resolved
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const Sentry = await import('@sentry/nextjs')

      Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Adjust this value in production, or use tracesSampler for greater control
        tracesSampleRate: 1,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: false,

        environment: process.env.NODE_ENV,
      })
    } catch (error) {
      console.warn('Sentry initialization failed:', error)
    }
  }
}

export const onRequestError = async (err: unknown, request: any, context: any) => {
  // Temporarily disable Sentry error capture in production
  if (process.env.NODE_ENV === 'development') {
    try {
      const Sentry = await import('@sentry/nextjs')
      await Sentry.captureRequestError(err, request, context)
    } catch (error) {
      console.warn('Sentry error capture failed:', error)
    }
  }
}
