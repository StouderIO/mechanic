import { CopyIcon } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button.tsx'

interface CopyProps {
  content: string
}

function Copy({ content }: CopyProps) {
  const [_, copyToClipboard] = useCopyToClipboard()

  const copy = useCallback(() => {
    copyToClipboard(content)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'))
  }, [content, copyToClipboard])

  return (
    <Button variant="ghost" size="icon" className="size-8" onClick={copy}>
      <CopyIcon />
    </Button>
  )
}

export { Copy }
