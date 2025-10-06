import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { UserNav } from '@/components/auth/UserNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-serif text-earth-900">Verscienta</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/herbs" className="transition-colors hover:text-earth-600">
            Herbs
          </Link>
          <Link href="/formulas" className="transition-colors hover:text-earth-600">
            Formulas
          </Link>
          <Link href="/conditions" className="transition-colors hover:text-earth-600">
            Conditions
          </Link>
          <Link href="/modalities" className="transition-colors hover:text-earth-600">
            Modalities
          </Link>
          <Link href="/practitioners" className="transition-colors hover:text-earth-600">
            Practitioners
          </Link>
          <Link href="/symptom-checker" className="transition-colors hover:text-earth-600">
            Symptom Checker
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/search"
            className="flex items-center justify-center rounded-lg p-2 hover:bg-earth-50 transition-colors"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5 text-gray-700" />
          </Link>

          <UserNav />
        </div>
      </div>
    </header>
  )
}
