/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Endpoint } from 'payload'

import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

const handlers: Record<string, Endpoint> = {
  GET: REST_GET,
  POST: REST_POST,
  DELETE: REST_DELETE,
  PATCH: REST_PATCH,
}

export { config, handlers }
