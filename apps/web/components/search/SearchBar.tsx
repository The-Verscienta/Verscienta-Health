'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/routing'

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  autoFocus?: boolean
}

export function SearchBar({ placeholder, defaultValue = '', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()
  const t = useTranslations()

  // Use provided placeholder or fallback to translated default
  const searchPlaceholder = placeholder || t('herbs.searchPlaceholder')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4"
          autoFocus={autoFocus}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <Button type="submit" className="btn-primary ml-2">
        {t('common.search')}
      </Button>
    </form>
  )
}
