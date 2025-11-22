/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* MANUALLY PATCHED FOR NEXT.JS 15.4+ COMPATIBILITY */
/* See: https://github.com/payloadcms/payload/issues (async params support) */

import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import type { NextRequest } from 'next/server'

// Wrap to handle async params in Next.js 15.4+
async function handleGET(_req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await params // Resolve params for Next.js 15.4+ compatibility
  return REST_GET(config)
}

async function handlePOST(_req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await params // Resolve params for Next.js 15.4+ compatibility
  return REST_POST(config)
}

async function handleDELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await params // Resolve params for Next.js 15.4+ compatibility
  return REST_DELETE(config)
}

async function handlePATCH(_req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await params // Resolve params for Next.js 15.4+ compatibility
  return REST_PATCH(config)
}

export { handleGET as GET, handlePOST as POST, handleDELETE as DELETE, handlePATCH as PATCH }
