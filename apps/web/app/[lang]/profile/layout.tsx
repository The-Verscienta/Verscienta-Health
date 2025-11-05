import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = false

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
