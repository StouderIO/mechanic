import { Slot } from '@radix-ui/react-slot'
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  type HTMLAttributes,
} from 'react'
import { Card } from '@/components/ui/card.tsx'
import { cn } from '@/lib/utils'

interface StatCardProps extends ComponentPropsWithoutRef<typeof Card> {
  asChild?: boolean
}

const StatCard = forwardRef<ComponentRef<typeof Card>, StatCardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : Card
    return (
      <Comp
        ref={ref}
        className={cn(
          'bg-white rounded-lg shadow-sm flex flex-row items-center gap-4 px-6',
          className,
        )}
        {...props}
      />
    )
  },
)
StatCard.displayName = 'StatCard'

interface StatCardIconProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const StatCardIcon = forwardRef<HTMLDivElement, StatCardIconProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return <Comp ref={ref} className={className} {...props} />
  },
)

StatCardIcon.displayName = 'StatCardIcon'

interface StatCardContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const StatCardContent = forwardRef<HTMLDivElement, StatCardContentProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp ref={ref} className={cn('flex flex-col', className)} {...props} />
    )
  },
)

StatCardContent.displayName = 'StatCardContent'

interface StatCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
}

const StatCardTitle = forwardRef<HTMLHeadingElement, StatCardTitleProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h3'
    return (
      <Comp
        ref={ref}
        className={cn('text-md font-medium text-gray-500', className)}
        {...props}
      />
    )
  },
)
StatCardTitle.displayName = 'StatCardTitle'

interface StatCardValueProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean
}

const StatCardValue = forwardRef<HTMLParagraphElement, StatCardValueProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'p'
    return (
      <Comp
        ref={ref}
        className={cn('text-2xl font-semibold text-gray-900', className)}
        {...props}
      />
    )
  },
)
StatCardValue.displayName = 'StatCardValue'

export { StatCard, StatCardIcon, StatCardContent, StatCardTitle, StatCardValue }
