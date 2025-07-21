import { useCallback, useState } from 'react'
import { CreateAdminTokenForm } from '@/components/admin-tokens/forms/create-admin-token-form.tsx'
import { CreateButton } from '@/components/composed/create-button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'

interface CreateAdminTokenDialogProps {
  onCreate: () => void
}

function CreateAdminTokenDialog({ onCreate }: CreateAdminTokenDialogProps) {
  const [isCreateAdminTokenDialogOpen, setCreateAdminTokenDialogOpen] =
    useState(false)

  const onCreateInternal = useCallback(() => {
    onCreate()
    setCreateAdminTokenDialogOpen(false)
  }, [onCreate])

  return (
    <Dialog
      open={isCreateAdminTokenDialogOpen}
      onOpenChange={setCreateAdminTokenDialogOpen}
    >
      <DialogTrigger asChild>
        <CreateButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create admin token</DialogTitle>
          <CreateAdminTokenForm onCreate={onCreateInternal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { CreateAdminTokenDialog }
