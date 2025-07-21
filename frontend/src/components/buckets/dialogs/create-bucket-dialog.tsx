import { useCallback, useState } from 'react'
import { CreateBucketForm } from '@/components/buckets/forms/create-bucket-form.tsx'
import { CreateButton } from '@/components/composed/create-button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'

interface CreateBucketDialogProps {
  onCreate: () => void
}

function CreateBucketDialog({ onCreate }: CreateBucketDialogProps) {
  const [isCreateBucketDialogOpen, setCreateBucketDialogOpen] = useState(false)

  const onCreateInternal = useCallback(() => {
    onCreate()
    setCreateBucketDialogOpen(false)
  }, [onCreate])

  return (
    <Dialog
      open={isCreateBucketDialogOpen}
      onOpenChange={setCreateBucketDialogOpen}
    >
      <DialogTrigger asChild>
        <CreateButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create bucket</DialogTitle>
          <CreateBucketForm onCreate={onCreateInternal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { CreateBucketDialog }
