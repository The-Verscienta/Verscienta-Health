import { config } from 'dotenv'
import express from 'express'
import payload from 'payload'
import configPayload from '../payload.config.js'

const app = express()
const PORT = process.env.PORT || 3001

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

// Health check endpoint for Docker and monitoring
app.get('/api/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'verscienta-cms',
  })
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    config: configPayload,
  })

  // Add your own express routes here

  app.listen(PORT, async () => {
    payload.logger.info(`Server listening on port ${PORT}`)
    payload.logger.info(`Admin URL: http://localhost:${PORT}/admin`)
  })
}

start()
