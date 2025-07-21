import type { UseNavigateResult } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BucketKeysTable } from '@/components/buckets/manage/bucket-keys-table.tsx'
import { AllowKeyDialog } from '@/components/buckets/manage/dialogs/allow-key-dialog.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { H3 } from '@/components/ui/typography/h3'
import type {
  GetBucketInfoResponse,
  ListKeysResponse,
} from '@/generated/orval/garage/endpoints.schemas.ts'

interface BucketManagePermissionsCardProps {
  bucketInfo: GetBucketInfoResponse
  keys: ListKeysResponse
  navigate: UseNavigateResult<'/buckets/$id'>
}
function BucketManagePermissionsCard({
  bucketInfo,
  keys,
  navigate,
}: BucketManagePermissionsCardProps) {
  const nonExpiredKeys = useMemo(
    () =>
      keys
        .filter((key) => !key.expired)
        .filter((key) => {
          const foundKey = bucketInfo.keys.find(
            (bucketKey) => bucketKey.accessKeyId === key.id,
          )
          return (
            foundKey === undefined ||
            (!foundKey.permissions.read &&
              !foundKey.permissions.write &&
              !foundKey.permissions.owner)
          )
        }),
    [keys, bucketInfo.keys],
  )

  const refresh = useCallback(() => {
    navigate({ to: '.' }).catch(toast.error)
  }, [navigate])

  const [isAllowKeyDialogOpen, setAllowKeyDialogOpen] = useState(false)

  const onAllow = useCallback(() => {
    setAllowKeyDialogOpen(false)
    refresh()
  }, [refresh])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <H3>Permissions</H3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-row-reverse">
            <AllowKeyDialog
              bucketInfo={bucketInfo}
              availableKeys={nonExpiredKeys}
              onAllow={onAllow}
              open={isAllowKeyDialogOpen}
              onOpenChange={setAllowKeyDialogOpen}
            />
          </div>
          <BucketKeysTable
            bucketInfo={bucketInfo}
            onPermissionChange={refresh}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { BucketManagePermissionsCard }
