import { useMemo } from 'react'
import { AllowKeyForm } from '@/components/buckets/manage/forms/allow-key-form.tsx'
import { CreateButton } from '@/components/composed/create-button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import type {
  GetBucketInfoResponse,
  ListKeysResponseItem,
} from '@/generated/orval/garage/endpoints.schemas.ts'
import type { DialogProps } from '@/types/dialog-props.ts'
import type { Permission } from '@/types/permission.ts'

interface AllowKeyDialogProps extends DialogProps {
  bucketInfo: GetBucketInfoResponse
  availableKeys: ListKeysResponseItem[]
  onAllow: () => void
}

function AllowKeyDialog({
  bucketInfo,
  availableKeys,
  onAllow,
  open,
  onOpenChange,
}: AllowKeyDialogProps) {
  const permissions = useMemo(
    () =>
      availableKeys.map(
        (key) =>
          ({
            accessKeyId: key.id,
            name: key.name,
            read: false,
            write: false,
            owner: false,
          }) as Permission,
      ),
    [availableKeys],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <CreateButton>Allow keys</CreateButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allow keys</DialogTitle>
          <AllowKeyForm
            permissions={permissions}
            bucketInfo={bucketInfo}
            onAllowed={onAllow}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
export { AllowKeyDialog }
