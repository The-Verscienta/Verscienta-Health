'use client'

import dynamic from 'next/dynamic'
import { swaggerSpec } from '@/lib/swagger'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import SwaggerUI to avoid SSR issues
// @ts-expect-error - Type compatibility issue between React 19 and @types/swagger-ui-react
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <SwaggerUI spec={swaggerSpec} />
    </div>
  )
}
