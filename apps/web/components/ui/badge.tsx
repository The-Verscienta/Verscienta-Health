import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-earth-100 text-earth-700 dark:bg-earth-900 dark:text-earth-300',
        sage: 'bg-sage-100 text-sage-700 dark:bg-sage-900 dark:text-sage-300',
        tcm: 'bg-tcm-100 text-tcm-600 dark:bg-tcm-600 dark:text-white',
        gold: 'bg-gold-100 text-gold-600 dark:bg-gold-600 dark:text-white',
        success: 'bg-success-light text-success-dark',
        warning: 'bg-warning-light text-warning-dark',
        danger: 'bg-danger-light text-danger-dark',
        info: 'bg-info-light text-info-dark',
        outline: 'border border-gray-300 bg-transparent text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
