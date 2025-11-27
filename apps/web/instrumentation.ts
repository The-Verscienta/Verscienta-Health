export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs')

    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      environment: process.env.NODE_ENV,
    })
  }
}

export const onRequestError = async (err: unknown, request: any, context: any) => {
  const Sentry = await import('@sentry/nextjs')
  await Sentry.captureRequestError(err, request, context)
}
