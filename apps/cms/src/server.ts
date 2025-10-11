import { config } from 'dotenv'
import express from 'express'
import payload from 'payload'
import configPayload from '../payload.config.js'

const PORT = process.env.PORT || 3001

const start = async () => {
  try {
    // Initialize Payload without Express - let it create its own
    console.log('[DEBUG] About to initialize Payload...')
    await payload.init({
      config: configPayload,
    })
    console.log('[DEBUG] Payload initialized successfully')

    // Get Payload's Express app
    const app = payload.express()
    console.log('[DEBUG] Got Payload express app')

    // Add our health check endpoint
    app.get('/api/health', (_, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'verscienta-cms',
      })
    })
    console.log('[DEBUG] Added health check endpoint')

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
