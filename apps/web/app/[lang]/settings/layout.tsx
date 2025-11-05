import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = false

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
