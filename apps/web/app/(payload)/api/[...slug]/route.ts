/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { NextRequest } from 'next/server'

import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

export const GET = (req: NextRequest, options: { params: Promise<{ slug: string[] }> }) =>
  REST_GET(req, options, config)

export const POST = (req: NextRequest, options: { params: Promise<{ slug: string[] }> }) =>
  REST_POST(req, options, config)

export const DELETE = (req: NextRequest, options: { params: Promise<{ slug: string[] }> }) =>
  REST_DELETE(req, options, config)

export const PATCH = (req: NextRequest, options: { params: Promise<{ slug: string[] }> }) =>
  REST_PATCH(req, options, config)
