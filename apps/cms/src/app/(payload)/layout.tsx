/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'

type Args = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Verscienta Health CMS',
  description: 'Admin panel for Verscienta Health content management',
}

const Layout = ({ children }: Args) => <RootLayout config={config} importMap={importMap}>{children}</RootLayout>

export default Layout
