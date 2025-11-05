/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'

import './custom.scss'

import { importMap } from './importMap'

type Args = {
  children: React.ReactNode
}

// Create server function as required by beta.128+
async function serverFunction(args: any) {
  'use server'
  return handleServerFunctions(args)
}

export const metadata: Metadata = {
  title: config?.admin?.meta?.titleSuffix ? `Payload ${config.admin.meta.titleSuffix}` : 'Payload',
  description: 'Payload CMS Admin Panel',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
