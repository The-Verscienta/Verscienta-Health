import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters
    const title = searchParams.get('title') || 'Verscienta Health'
    const subtitle = searchParams.get('subtitle') || 'Holistic Health & Traditional Medicine'
    const type = searchParams.get('type') || 'default' // herb, condition, practitioner, etc.

    // Different gradients for different content types
    const gradients = {
      herb: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      condition: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      formula: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      practitioner: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }

    const gradient = gradients[type as keyof typeof gradients] || gradients.default

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: gradient,
          padding: '80px',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            🌿
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Verscienta Health
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '900px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.1,
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Footer Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              textTransform: 'capitalize',
            }}
          >
            {type === 'default' ? 'Health Resource' : type}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG Image generation error:', e.message)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
