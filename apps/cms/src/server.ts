import { config } from 'dotenv'
import express from 'express'
import payload from 'payload'

const app = express()
const PORT = process.env.PORT || 3001

// Health check endpoint for Docker and monitoring (before Payload routes)
app.get('/api/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'verscienta-cms',
  })
})

const start = async () => {
  try {
    // Initialize Payload - it will automatically find payload.config.ts
    console.log('[DEBUG] About to initialize Payload...')
    await payload.init({
      express: app,
    })
    console.log('[DEBUG] Payload initialized successfully')
    console.log('[DEBUG] Payload admin route should be at: /admin')

    // Redirect root to Admin panel (after Payload routes)
    app.get('/', (_, res) => {
      res.redirect('/admin')
    })

    app.listen(PORT, async () => {
      payload.logger.info(`Server listening on port ${PORT}`)
      payload.logger.info(`Admin URL: http://localhost:${PORT}/admin`)

      // Log all registered routes for debugging
      console.log('[DEBUG] Registered routes:')
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          console.log(`  ${Object.keys(middleware.route.methods)} ${middleware.route.path}`)
        } else if (middleware.name === 'router') {
          console.log('  Router middleware mounted')
        }
      })
    })
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error)
    process.exit(1)
  }
}

start()
