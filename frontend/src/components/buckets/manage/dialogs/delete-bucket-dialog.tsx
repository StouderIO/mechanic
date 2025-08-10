import { useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { P } from '@/components/ui/typography/p'
import { useDeleteBucket } from '@/generated/orval/garage/bucket/bucket.ts'
import type { GetBucketInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'
import { extractError } from '@/lib/utils.tsx'
import type { DialogProps } from '@/types/dialog-props.ts'

interface DeleteBucketDialogProps extends DialogProps {
  bucketInfo: GetBucketInfoResponse
  onDeleted: () => void
}

function DeleteBucketDialog({
  bucketInfo,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBucketDialogProps) {
  const { isPending, mutate } = useDeleteBucket({
    mutation: {
      onSuccess: () => {
        onDeleted()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const deleteBucket = useCallback(() => {
    mutate({
      params: {
        id: bucketInfo.id,
      },
    })
  }, [bucketInfo.id, mutate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete bucket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete bucket</DialogTitle>
          <P>
            Are you really sure you want to delete this bucket? <br />
            This action cannot be undone. <br />
            All the data in this bucket will be permanently deleted.
          </P>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={deleteBucket}
          >
            Delete bucket
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteBucketDialog }
