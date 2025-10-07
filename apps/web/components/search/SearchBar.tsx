'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = 'Search herbs, conditions, or treatments...',
  defaultValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

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
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4"
          autoFocus={autoFocus}
        />
      </div>
      <Button type="submit" className="btn-primary ml-2">
        Search
      </Button>
    </form>
  )
}
