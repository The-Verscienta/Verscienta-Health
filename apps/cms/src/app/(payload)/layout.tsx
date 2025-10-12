/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'
import type { ServerFunctionClient } from 'payload'
import { ReactNode } from 'react'

import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'

import '@payloadcms/next/css'

type Args = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Verscienta Health CMS',
  description: 'Admin panel for Verscienta Health content management',
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
