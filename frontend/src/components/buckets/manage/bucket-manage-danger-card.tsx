import type { UseNavigateResult } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { DeleteBucketDialog } from '@/components/buckets/manage/dialogs/delete-bucket-dialog.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import type { GetBucketInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'

interface BucketManageDangerCardProps {
  bucketInfo: GetBucketInfoResponse
  navigate: UseNavigateResult<'/buckets/$id'>
}

function BucketManageDangerCard({
  bucketInfo,
  navigate,
}: BucketManageDangerCardProps) {
  const goBackToBucketList = useCallback(() => {
    navigate({ to: '/buckets' }).catch(toast.error)
  }, [navigate])
  const [isDeleteBucketDialogOpen, setDeleteBucketDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <H3>Danger zone</H3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DeleteBucketDialog
          open={isDeleteBucketDialogOpen}
          onOpenChange={setDeleteBucketDialogOpen}
          onDeleted={goBackToBucketList}
          bucketInfo={bucketInfo}
        />
      </CardContent>
    </Card>
  )
}

export { BucketManageDangerCard }
