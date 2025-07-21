import type * as React from 'react'
import { cn } from '@/lib/utils.tsx'

export function H1({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      {...props}
      className={cn(
        'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
        className,
      )}
    />
  )
}
