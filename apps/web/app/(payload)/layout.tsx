/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { Metadata } from 'next'

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

export async function generateMetadata(): Promise<Metadata> {
  const resolvedConfig = await config
  return {
    title: resolvedConfig?.admin?.meta?.titleSuffix
      ? `Payload ${resolvedConfig.admin.meta.titleSuffix}`
      : 'Payload',
    description: 'Payload CMS Admin Panel',
  }
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
