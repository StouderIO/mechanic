import { createFileRoute } from '@tanstack/react-router'
import {
  DatabaseIcon,
  FrownIcon,
  HardDriveIcon,
  MehIcon,
  NotebookIcon,
  NotebookPenIcon,
  NotebookTextIcon,
  SaveIcon,
  ServerIcon,
  SmileIcon,
  SquareStackIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { PageError } from '@/components/composed/page-error.tsx'
import {
  StatCard,
  StatCardContent,
  StatCardIcon,
  StatCardTitle,
  StatCardValue,
} from '@/components/composed/stat-card'
import { Spinner } from '@/components/ui/spinner.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import {
  getBucketInfo,
  listBuckets,
} from '@/generated/orval/garage/bucket/bucket.ts'
import { getClusterHealth } from '@/generated/orval/garage/cluster/cluster.ts'
import { getClusterLayout } from '@/generated/orval/garage/cluster-layout/cluster-layout.ts'
import { bytesFormatter } from '@/lib/utils.tsx'

export const Route = createFileRoute('/_pathlessLayout/')({
  component: IndexPage,
  loader: () =>
    Promise.all([
      getClusterHealth(),
      listBuckets().then((buckets) =>
        Promise.all(buckets.map((bucket) => getBucketInfo({ id: bucket.id }))),
      ),
      getClusterLayout(),
    ]).then(([clusterHealth, buckets, clusterLayout]) => ({
      clusterHealth,
      buckets,
      clusterLayout,
    })),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading admin tokens" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function IndexPage() {
  const { clusterHealth, buckets, clusterLayout } = Route.useLoaderData()

  const redundancy = useMemo(() => {
    if (clusterLayout.parameters.zoneRedundancy === 'maximum') {
      return 'Maximum'
    }
    return `${clusterLayout.parameters.zoneRedundancy.atLeast} zones`
  }, [clusterLayout.parameters.zoneRedundancy])

  const totalSize = useMemo(
    () =>
      buckets
        .map((bucket) => bucket.bytes)
        .reduce((acc, current) => acc + current, 0),
    [buckets],
  )

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon asChild>
              {(() => {
                switch (clusterHealth.status) {
                  case 'healthy':
                    return <SmileIcon size={48} />
                  case 'degraded':
                    return <MehIcon size={48} />
                  case 'unavailable':
                    return <FrownIcon size={48} />
                }
              })()}
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>
                {clusterHealth.status.toUpperCase()}
              </StatCardValue>
              <StatCardTitle>Status</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          {(() => {
            switch (clusterHealth.status) {
              case 'healthy':
                return 'Garage node is connected to all storage nodes'
              case 'degraded':
                return 'Garage node is not connected to all storage nodes, but a quorum of write nodes is available for all partitions.'
              case 'unavailable':
                return 'A quorum of write nodes is not available for some partitions.'
            }
          })()}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <DatabaseIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{clusterHealth.storageNodes}</StatCardValue>
              <StatCardTitle>Registered storage nodes</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The number of storage nodes currently registered in the cluster
          layout.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <ServerIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{clusterHealth.storageNodesOk}</StatCardValue>
              <StatCardTitle>Connected storages nodes</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The number of storage nodes to which a connection is currently open.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <NotebookIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{clusterHealth.partitions}</StatCardValue>
              <StatCardTitle>Partitions</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The total number of partitions of the data. (currently always 256)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <NotebookPenIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{clusterHealth.partitionsQuorum}</StatCardValue>
              <StatCardTitle>Partitions with quorum</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The number of partitions for which a quorum of write nodes is
          available.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <NotebookTextIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{clusterHealth.partitionsAllOk}</StatCardValue>
              <StatCardTitle>Active partitions</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The number of partitions for which we are connected to all storage
          nodes responsible of storing it.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <SaveIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>
                {bytesFormatter(clusterLayout.partitionSize)}
              </StatCardValue>
              <StatCardTitle>Partition size</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          The size of one Garage partition. (= a shard)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <SquareStackIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{redundancy}</StatCardValue>
              <StatCardTitle>Redundancy</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>
          Minimum number of zones in which a data partition must be replicated.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatCard>
            <StatCardIcon>
              <HardDriveIcon size={48} />
            </StatCardIcon>
            <StatCardContent>
              <StatCardValue>{bytesFormatter(totalSize)}</StatCardValue>
              <StatCardTitle>Buckets size</StatCardTitle>
            </StatCardContent>
          </StatCard>
        </TooltipTrigger>
        <TooltipContent>Size of files stored in buckets.</TooltipContent>
      </Tooltip>
    </div>
  )
}
