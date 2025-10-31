import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: `${process.env.CLOUDFLARE_ACCOUNT_HASH}.r2.cloudflarestorage.com`,
      },
    ],
  },
}

export default withPayload(nextConfig)
