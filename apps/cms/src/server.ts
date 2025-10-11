import { getPayload } from 'payload'
import configPayload from '../payload.config.js'

const PORT = process.env.PORT || 3001

const start = async () => {
  try {
    console.log('[DEBUG] Starting Payload CMS...')

    // Initialize Payload using the new v3 pattern
    const payload = await getPayload({
      config: configPayload,
    })

    console.log('[DEBUG] Payload initialized successfully')

    // Start the server
    await payload.start()

    console.log('[DEBUG] Server started on port', PORT)
    console.log('[DEBUG] Admin URL: http://localhost:' + PORT + '/admin')
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error)
    process.exit(1)
  }
}

start()
