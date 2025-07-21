import type * as React from 'react'
import { cn } from '@/lib/utils.tsx'

export function H2({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      {...props}
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
    />
  )
}
