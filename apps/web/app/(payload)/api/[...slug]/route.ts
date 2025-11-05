/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* MANUALLY PATCHED FOR NEXT.JS 15.4+ COMPATIBILITY */
/* See: https://github.com/payloadcms/payload/issues (async params support) */
import type { NextRequest } from 'next/server'

import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

// Wrap to handle async params in Next.js 15.4+
async function handleGET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  return REST_GET(req, { params: resolvedParams }, config)
}

async function handlePOST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  return REST_POST(req, { params: resolvedParams }, config)
}

async function handleDELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  return REST_DELETE(req, { params: resolvedParams }, config)
}

async function handlePATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  return REST_PATCH(req, { params: resolvedParams }, config)
}

export { handleGET as GET, handlePOST as POST, handleDELETE as DELETE, handlePATCH as PATCH }
