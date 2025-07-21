import type { UseNavigateResult } from '@tanstack/react-router'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AddAliasForm } from '@/components/buckets/manage/forms/add-alias-form.tsx'
import { UpdateQuotasForm } from '@/components/buckets/manage/forms/update-quotas-form.tsx'
import { UpdateWebsiteForm } from '@/components/buckets/manage/forms/update-website-form.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { H3 } from '@/components/ui/typography/h3.tsx'
import { H4 } from '@/components/ui/typography/h4.tsx'
import { removeBucketAlias } from '@/generated/orval/garage/bucket-alias/bucket-alias.ts'
import type {
  BucketAliasEnum,
  GetBucketInfoResponse,
} from '@/generated/orval/garage/endpoints.schemas.ts'
import { extractError } from '@/lib/utils.tsx'

interface BucketManageInformationProps {
  bucketInfo: GetBucketInfoResponse
  navigate: UseNavigateResult<'/buckets/$id'>
}

function BucketManageInfoCard({
  bucketInfo,
  navigate,
}: BucketManageInformationProps) {
  const deleteAlias = useCallback(
    async (aliasToDelete: BucketAliasEnum) => {
      const alias =
        'globalAlias' in aliasToDelete
          ? aliasToDelete.globalAlias
          : aliasToDelete.localAlias
      try {
        await removeBucketAlias({ ...aliasToDelete, bucketId: bucketInfo.id })
        await navigate({ to: '.' })
        return toast.success(`Bucket alias "${alias}" deleted`)
      } catch (error) {
        return toast.error(extractError(error))
      }
    },
    [bucketInfo.id, navigate],
  )
  const aliases: BucketAliasEnum[] = useMemo(
    () =>
      bucketInfo === null
        ? []
        : [
            ...bucketInfo.globalAliases.map((globalAlias) => ({
              globalAlias,
            })),
            ...bucketInfo.keys.flatMap((key) =>
              key.bucketLocalAliases.map((localAlias) => ({
                accessKeyId: key.accessKeyId,
                localAlias,
              })),
            ),
          ],
    [bucketInfo],
  )

  const [isAliasPopoverOpen, setAliasPopoverOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <H3>Informations</H3>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <H4>Aliases</H4>
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <Button
                key={
                  'globalAlias' in alias ? alias.globalAlias : alias.localAlias
                }
                variant="outline"
                size="sm"
                onClick={() => deleteAlias(alias)}
              >
                <Trash2Icon />{' '}
                {'globalAlias' in alias ? alias.globalAlias : alias.localAlias}
              </Button>
            ))}
            <Popover
              open={isAliasPopoverOpen}
              onOpenChange={setAliasPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button size="sm">
                  <PlusIcon />
                  Add
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <AddAliasForm
                  bucketId={bucketInfo.id}
                  onClose={() => {
                    navigate({ to: '.' })
                    setAliasPopoverOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <H4>Website</H4>
          <UpdateWebsiteForm
            bucketId={bucketInfo.id}
            defaultValues={
              bucketInfo.websiteAccess
                ? {
                    enabled: true,
                    indexDocument: bucketInfo.websiteConfig?.indexDocument,
                    errorDocument:
                      bucketInfo.websiteConfig?.errorDocument ?? undefined,
                  }
                : {
                    enabled: false,
                    indexDocument: undefined,
                    errorDocument: undefined,
                  }
            }
            onClose={() => navigate({ to: '.' })}
          />
        </div>
        <div className="flex flex-col gap-2 items-start">
          <H4>Quotas</H4>
          <UpdateQuotasForm
            bucketId={bucketInfo.id}
            defaultValues={
              bucketInfo.quotas === null ||
              (bucketInfo.quotas.maxSize == null &&
                bucketInfo.quotas.maxObjects == null)
                ? {
                    enabled: false,
                  }
                : {
                    enabled: true,
                    maxSize: bucketInfo.quotas.maxSize ?? undefined,
                    maxObjects: bucketInfo.quotas.maxObjects ?? undefined,
                  }
            }
            onClose={() => navigate({ to: '.' })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { BucketManageInfoCard }
