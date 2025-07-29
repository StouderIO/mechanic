import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import BucketCard from '@/components/buckets/bucket-card.tsx'
import { CreateBucketDialog } from '@/components/buckets/dialogs/create-bucket-dialog.tsx'
import { PageError } from '@/components/composed/page-error'
import { Spinner } from '@/components/ui/spinner.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import {
  getBucketInfo,
  listBuckets,
} from '@/generated/orval/garage/bucket/bucket.ts'
import { getMetaInfo } from '@/generated/orval/mechanic/meta-controller/meta-controller.ts'

export const Route = createFileRoute('/_pathlessLayout/buckets/')({
  component: BucketsPage,
  loader: async () => {
    const [buckets, meta] = await Promise.all([listBuckets(), getMetaInfo()])

    const bucketsWithInfos = await Promise.all(
      buckets.map(async (bucket) => {
        const info = await getBucketInfo({ id: bucket.id })
        return {
          ...bucket,
          info,
        }
      }),
    )

    return {
      buckets: bucketsWithInfos,
      meta,
    }
  },
  errorComponent: ({ error }) => (
    <PageError title="Error while loading buckets" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function BucketsPage() {
  const { buckets, meta } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const refresh = useCallback(() => navigate({ to: '.' }), [navigate])

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-row-reverse">
        <CreateBucketDialog onCreate={refresh} />
      </div>
      {buckets.length === 0 && (
        <H3>
          No bucket found, maybe you want to create one?{' '}
          <CreateBucketDialog onCreate={refresh} />
        </H3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {buckets.map((bucket) => (
          <BucketCard
            key={bucket.id}
            bucket={bucket}
            browsable={meta.browseEnabled}
          />
        ))}
      </div>
    </div>
  )
}
