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

interface UploadFileDialogProps {
  onUploaded: () => void
}

function UploadFileDialog({ onUploaded }: UploadFileDialogProps) {
  const [isUploadFileDialogOpen, setUploadFileDialogOpen] = useState(false)

  const onUploadedInternal = useCallback(() => {
    onUploaded()
    setUploadFileDialogOpen(false)
  }, [onUploaded])

  return (
    <Dialog
      open={isUploadFileDialogOpen}
      onOpenChange={setUploadFileDialogOpen}
    >
      <DialogTrigger asChild>
        <CreateButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <CreateBucketForm onCreate={onUploadedInternal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export type { UploadFileDialog }
