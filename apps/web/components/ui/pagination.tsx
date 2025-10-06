import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  // Show ellipsis if there's a gap
  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }

  // Show ellipsis if there's a gap
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  // Always show last page if more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return (
    <nav
      className={cn('flex items-center justify-center space-x-2', className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Link
        href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-earth-200 text-earth-700 transition-colors hover:bg-earth-50',
          currentPage <= 1 && 'pointer-events-none opacity-50'
        )}
        aria-label="Go to previous page"
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-earth-600"
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )
        }

        const isActive = page === currentPage

        return (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
              isActive
                ? 'border-earth-600 bg-earth-600 text-white'
                : 'border-earth-200 text-earth-700 hover:bg-earth-50'
            )}
            aria-label={isActive ? `Current page, page ${page}` : `Go to page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      })}

      {/* Next button */}
      <Link
        href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-earth-200 text-earth-700 transition-colors hover:bg-earth-50',
          currentPage >= totalPages && 'pointer-events-none opacity-50'
        )}
        aria-label="Go to next page"
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
