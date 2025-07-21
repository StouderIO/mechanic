import type * as React from 'react'
import { cn } from '@/lib/utils.tsx'

export function H3({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      {...props}
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className,
      )}
    />
  )
}
