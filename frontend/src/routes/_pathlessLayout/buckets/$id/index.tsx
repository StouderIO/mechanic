import { createFileRoute } from '@tanstack/react-router'
import { BucketManageDangerCard } from '@/components/buckets/manage/bucket-manage-danger-card.tsx'
import { BucketManageInfoCard } from '@/components/buckets/manage/bucket-manage-info-card'
import { BucketManagePermissionsCard } from '@/components/buckets/manage/bucket-manage-permissions-card.tsx'
import { PageError } from '@/components/composed/page-error.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { listKeys } from '@/generated/orval/garage/access-key/access-key.ts'
import { getBucketInfo } from '@/generated/orval/garage/bucket/bucket.ts'

export const Route = createFileRoute('/_pathlessLayout/buckets/$id/')({
  component: BucketPage,
  loader: ({ params }) =>
    Promise.all([getBucketInfo({ id: params.id }), listKeys()]).then(
      ([bucketInfo, keys]) => ({
        crumb: 'Manage',
        bucketInfo,
        keys,
      }),
    ),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading bucket infos" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function BucketPage() {
  const { bucketInfo, keys } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BucketManageInfoCard bucketInfo={bucketInfo} navigate={navigate} />
      <BucketManagePermissionsCard
        bucketInfo={bucketInfo}
        keys={keys}
        navigate={navigate}
      />
      <BucketManageDangerCard bucketInfo={bucketInfo} navigate={navigate} />
    </div>
  )
}
