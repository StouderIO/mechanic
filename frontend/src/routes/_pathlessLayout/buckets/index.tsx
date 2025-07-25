import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { toast } from 'sonner'
import BucketCard from '@/components/buckets/bucket-card.tsx'
import { CreateBucketDialog } from '@/components/buckets/dialogs/create-bucket-dialog.tsx'
import { PageError } from '@/components/composed/page-error'
import { Spinner } from '@/components/ui/spinner.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import { listBuckets } from '@/generated/orval/garage/bucket/bucket.ts'
import { getMetaInfo } from '@/generated/orval/mechanic/meta-controller/meta-controller.ts'

export const Route = createFileRoute('/_pathlessLayout/buckets/')({
  component: BucketsPage,
  loader: () =>
    Promise.all([listBuckets(), getMetaInfo()]).then(([buckets, meta]) => ({
      buckets,
      meta,
    })),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading buckets" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function BucketsPage() {
  const { buckets, meta } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const refresh = useCallback(
    () => navigate({ to: '.' }).catch(toast.error),
    [navigate],
  )

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
            id={bucket.id}
            aliases={[
              ...bucket.globalAliases,
              ...bucket.localAliases.map((alias) => alias.alias),
            ]}
            browsable={meta.browseEnabled}
          />
        ))}
      </div>
    </div>
  )
}
