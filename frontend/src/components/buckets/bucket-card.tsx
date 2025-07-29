import { Link } from '@tanstack/react-router'
import { BadgeCheckIcon, CogIcon, FolderIcon } from 'lucide-react'
import { useMemo } from 'react'
import BucketStats from '@/components/buckets/bucket-stats.tsx'
import { TooltipText } from '@/components/composed/tooltip-text.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import type {
  GetBucketInfoResponse,
  ListBucketsResponseItem,
} from '@/generated/orval/garage/endpoints.schemas.ts'

export interface BucketWithInfo extends ListBucketsResponseItem {
  info: GetBucketInfoResponse
}

interface BucketCardProps {
  bucket: BucketWithInfo
  browsable: boolean
}
export default function BucketCard({ bucket, browsable }: BucketCardProps) {
  const id = useMemo(() => bucket.id, [bucket.id])

  const aliases = useMemo(
    () => [
      ...bucket.globalAliases,
      ...bucket.localAliases.map((alias) => alias.alias),
    ],
    [bucket],
  )

  const storage = useMemo(
    () =>
      bucket === null
        ? { value: 0, quota: 0 }
        : {
            value: bucket.info.bytes,
            quota: bucket.info.quotas.maxSize ?? undefined,
          },
    [bucket],
  )
  const objects = useMemo(
    () =>
      bucket.info === null
        ? { value: 0, quota: 0 }
        : {
            value: bucket.info.objects,
            quota: bucket.info.quotas.maxObjects ?? undefined,
          },
    [bucket.info],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <H3>{aliases.join(', ')}</H3>
        </CardTitle>
        <CardDescription>
          <TooltipText content={id}>
            <p>{id.substring(0, 16)}</p>
          </TooltipText>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BucketStats storage={storage} objects={objects} />
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-row-reverse justify-between">
          <div className="flex gap-2">
            {browsable && (
              <Link to="/buckets/$id/browse" params={{ id }}>
                <Button>
                  <FolderIcon /> Browse
                </Button>
              </Link>
            )}
            <Link to="/buckets/$id" params={{ id }}>
              <Button>
                <CogIcon /> Manage
              </Button>
            </Link>
          </div>
          {bucket.info.websiteAccess && (
            <Badge variant="secondary">
              <BadgeCheckIcon /> Website enabled
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
