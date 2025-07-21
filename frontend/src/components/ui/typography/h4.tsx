import type * as React from 'react'
import { cn } from '@/lib/utils.tsx'

export function H4({ className, ...props }: React.ComponentProps<'h4'>) {
  return (
    <h4
      {...props}
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className,
      )}
    />
  )
}
