import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { UserNav } from '@/components/auth/UserNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-earth-900 font-serif text-2xl font-bold">Verscienta</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link href="/herbs" className="hover:text-earth-600 transition-colors">
            Herbs
          </Link>
          <Link href="/formulas" className="hover:text-earth-600 transition-colors">
            Formulas
          </Link>
          <Link href="/conditions" className="hover:text-earth-600 transition-colors">
            Conditions
          </Link>
          <Link href="/modalities" className="hover:text-earth-600 transition-colors">
            Modalities
          </Link>
          <Link href="/practitioners" className="hover:text-earth-600 transition-colors">
            Practitioners
          </Link>
          <Link href="/symptom-checker" className="hover:text-earth-600 transition-colors">
            Symptom Checker
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/search"
            className="hover:bg-earth-50 flex items-center justify-center rounded-lg p-2 transition-colors"
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
