import express from 'express'
import { getPayload } from 'payload'
import config from './payload.config.js'

const PORT = process.env.PORT || 3001

async function start() {
  try {
    console.log('[DEBUG] Starting Payload CMS server...')

    // Create Express app first
    const app = express()

    // Add health check BEFORE initializing Payload
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'verscienta-cms',
      })
    })

    console.log('[DEBUG] Initializing Payload...')

    // Initialize Payload and pass the Express app
    const payload = await getPayload({
      config: {
        ...config,
        express: { app },
      },
    })

    console.log('[DEBUG] Payload initialized successfully')

    // Start the server
    app.listen(PORT, () => {
      console.log(`[INFO] Server listening on port ${PORT}`)
      console.log(`[INFO] Admin URL: http://localhost:${PORT}/admin`)
    })
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error)
    process.exit(1)
  }
}

start()
