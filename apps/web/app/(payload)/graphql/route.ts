/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { NextRequest } from 'next/server'

import config from '@payload-config'
import { GRAPHQL_GET, GRAPHQL_POST } from '@payloadcms/next/routes'

export const GET = (req: NextRequest) => GRAPHQL_GET(req, config)

export const POST = (req: NextRequest) => GRAPHQL_POST(req, config)
