import { config } from 'dotenv'
import express from 'express'
import payload from 'payload'
import configPayload from '../payload.config.js'

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
  // Initialize Payload with Express app
  await payload.init({
    express: app,
    config: configPayload,
  })

  // Redirect root to Admin panel (after Payload routes)
  app.get('/', (_, res) => {
    res.redirect('/admin')
  })

  app.listen(PORT, async () => {
    payload.logger.info(`Server listening on port ${PORT}`)
    payload.logger.info(`Admin URL: http://localhost:${PORT}/admin`)
  })
}

start()
