import { PlusIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button.tsx'

function CreateButton(
  props: ComponentProps<'button'> & {
    asChild?: boolean
  },
) {
  return (
    <Button {...props}>
      <PlusIcon />
      {props.children ?? 'Create'}
    </Button>
  )
}

export { CreateButton }
