import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = false

export default function SymptomCheckerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
