import { useCallback, useState } from 'react'
import { CreateButton } from '@/components/composed/create-button.tsx'
import { CreateKeyForm } from '@/components/keys/forms/create-key-form.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'

interface CreateKeyDialogProps {
  onCreate: () => void
}

function CreateKeyDialog({ onCreate }: CreateKeyDialogProps) {
  const [isCreateKeyDialogOpen, setCreateKeyDialogOpen] = useState(false)

  const onCreateInternal = useCallback(() => {
    onCreate()
    setCreateKeyDialogOpen(false)
  }, [onCreate])

  return (
    <Dialog open={isCreateKeyDialogOpen} onOpenChange={setCreateKeyDialogOpen}>
      <DialogTrigger asChild>
        <CreateButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create key</DialogTitle>
          <CreateKeyForm onCreate={onCreateInternal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { CreateKeyDialog }
