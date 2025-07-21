import { EyeIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useToggle } from 'usehooks-ts'
import { Button } from '@/components/ui/button.tsx'

interface RevealProps {
  children: ReactNode
}

function Reveal({ children }: RevealProps) {
  const [shown, toggle] = useToggle()

  if (shown) {
    return children
  }

  return (
    <Button variant="outline" onClick={toggle}>
      <EyeIcon />
      Reveal
    </Button>
  )
}

export { Reveal }
