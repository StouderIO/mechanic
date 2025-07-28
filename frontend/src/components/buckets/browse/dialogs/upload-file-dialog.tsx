import { UploadIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { UploadFileForm } from '@/components/buckets/browse/forms/upload-file-form.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'

interface UploadFileDialogProps {
  bucketId: string
  path: string
  onUploaded: () => void
}

function UploadFileDialog({
  bucketId,
  path,
  onUploaded,
}: UploadFileDialogProps) {
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
        <Button>
          <UploadIcon /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <UploadFileForm
            bucketId={bucketId}
            path={path}
            onUploaded={onUploadedInternal}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { UploadFileDialog }
