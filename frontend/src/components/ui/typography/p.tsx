import type * as React from 'react'
import { cn } from '@/lib/utils'

export function P({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      {...props}
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
    />
  )
}
