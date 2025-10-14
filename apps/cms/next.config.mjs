import { withPayload } from '@payloadcms/next/withPayload'

const NEXT_PUBLIC_SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: new URL(NEXT_PUBLIC_SERVER_URL).protocol.replace(':', ''),
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
  experimental: {
    reactCompiler: false,
  },
  // Fix ChunkLoadError - use contenthash instead of chunkhash for deterministic builds
  // See: https://github.com/vercel/next.js/issues/65856
  webpack: (config) => {
    config.output.filename = config.output.filename.replace('[chunkhash]', '[contenthash]')
    config.output.chunkFilename = config.output.chunkFilename.replace('[chunkhash]', '[contenthash]')
    return config
  },
  // Cache headers for proper static asset caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig)
