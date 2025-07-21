import { useCallback, useState } from 'react'
import { ConnectNodeForm } from '@/components/cluster/forms/connect-node-form.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'

interface ConnectNodeDialogProps {
  onConnect: () => void
}

function ConnectNodeDialog({ onConnect }: ConnectNodeDialogProps) {
  const [isConnectNodeDialogOpen, setConnectNodeDialogOpen] = useState(false)

  const onConnectInternal = useCallback(() => {
    onConnect()
    setConnectNodeDialogOpen(false)
  }, [onConnect])

  return (
    <Dialog
      open={isConnectNodeDialogOpen}
      onOpenChange={setConnectNodeDialogOpen}
    >
      <DialogTrigger asChild>
        <Button>Connect node</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect node</DialogTitle>
          <ConnectNodeForm onConnect={onConnectInternal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { ConnectNodeDialog }
