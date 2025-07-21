import { Link } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  CogIcon,
  FolderIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import BucketStats from '@/components/buckets/bucket-stats.tsx'
import { TooltipText } from '@/components/composed/tooltip-text.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
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
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import { useGetBucketInfo } from '@/generated/orval/garage/bucket/bucket'

interface BucketCardProps {
  id: string
  aliases: string[]
  browsable: boolean
}
export default function BucketCard({
  id,
  aliases,
  browsable,
}: BucketCardProps) {
  const { data, error, isLoading, isError, isSuccess } = useGetBucketInfo({
    id,
  })

  const bucketInfo = useMemo(() => data ?? null, [data])

  const storage = useMemo(
    () =>
      bucketInfo === null
        ? { value: 0, quota: 0 }
        : {
            value: bucketInfo.bytes,
            quota: bucketInfo.quotas.maxSize ?? undefined,
          },
    [bucketInfo],
  )
  const objects = useMemo(
    () =>
      bucketInfo === null
        ? { value: 0, quota: 0 }
        : {
            value: bucketInfo.objects,
            quota: bucketInfo.quotas.maxObjects ?? undefined,
          },
    [bucketInfo],
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
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        )}
        {isError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error while loading bucket infos.</AlertTitle>
            <AlertDescription>{error?.message}</AlertDescription>
          </Alert>
        )}
        {isSuccess && <BucketStats storage={storage} objects={objects} />}
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
          {isSuccess && bucketInfo?.websiteAccess && (
            <Badge variant="secondary">
              <BadgeCheckIcon /> Website enabled
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
