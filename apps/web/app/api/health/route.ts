import { NextResponse } from 'next/server'

/**
 * Health check endpoint for monitoring and Docker health checks
 */
export async function GET() {
  try {
    // Basic health check - can be extended to check database, external services, etc.
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'verscienta-web',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'verscienta-web',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
