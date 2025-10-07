import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'skeleton'
}

export function Loading({ className, size = 'md', variant = 'spinner' }: LoadingProps) {
  if (variant === 'skeleton') {
    return (
      <div
        className={cn(
          'bg-earth-100 animate-pulse rounded-md',
          {
            'h-4': size === 'sm',
            'h-8': size === 'md',
            'h-12': size === 'lg',
          },
          className
        )}
      />
    )
  }

  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-earth-200 border-t-earth-600 animate-spin rounded-full',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-earth-100 animate-pulse rounded-md', className)} />
}
