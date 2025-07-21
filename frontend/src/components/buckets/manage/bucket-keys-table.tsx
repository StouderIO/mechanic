import { zodResolver } from '@hookform/resolvers/zod'
import type { CheckedState } from '@radix-ui/react-checkbox'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2Icon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { type ControllerRenderProps, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AppTable } from '@/components/app-table.tsx'
import { Copy } from '@/components/composed/copy.tsx'
import { TooltipText } from '@/components/composed/tooltip-text.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form.tsx'
import type { GetBucketInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'
import {
  useAllowBucketKey,
  useDenyBucketKey,
} from '@/generated/orval/garage/permission/permission.ts'
import { extractError } from '@/lib/utils.tsx'
import type { Permission } from '@/types/permission.ts'

const formSchema = z.object({
  permissions: z.array(
    z.object({
      accessKeyId: z.string(),
      name: z.string(),
      read: z.boolean(),
      write: z.boolean(),
      owner: z.boolean(),
    }),
  ),
})
type FormData = z.infer<typeof formSchema>

const columnHelper = createColumnHelper<Permission>()

interface BucketKeysTableProps {
  bucketInfo: GetBucketInfoResponse
  onPermissionChange: () => void
}

function BucketKeysTable({
  bucketInfo,
  onPermissionChange,
}: BucketKeysTableProps) {
  const permissions = useMemo(
    () =>
      bucketInfo.keys
        .map((key) => ({
          accessKeyId: key.accessKeyId,
          name: key.name,
          read: key.permissions.read ?? false,
          write: key.permissions.write ?? false,
          owner: key.permissions.owner ?? false,
        }))
        .filter(({ read, write, owner }) => read || write || owner)
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    [bucketInfo.keys],
  )

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: { permissions },
  })

  const { isPending: isAllowPending, mutate: mutateAllow } = useAllowBucketKey({
    mutation: {
      onSuccess: () => {
        toast.success('Allowed permission to key')
        onPermissionChange()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })
  const { isPending: isDenyPending, mutate: mutateDeny } = useDenyBucketKey({
    mutation: {
      onSuccess: () => {
        toast.success('Denied permission to key')
        onPermissionChange()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const handleCheckboxPermissionChange = useCallback(
    (
      index: number,
      field: ControllerRenderProps<
        FormData,
        `permissions.${number}.${'read' | 'write' | 'owner'}`
      >,
    ) =>
      (checked: CheckedState) => {
        const realChecked = checked === true
        field.onChange(realChecked)

        const updatedPermission = form.getValues(`permissions.${index}`)
        if (realChecked) {
          mutateAllow({
            data: {
              accessKeyId: updatedPermission.accessKeyId,
              bucketId: bucketInfo.id,
              permissions: {
                read: updatedPermission.read,
                write: updatedPermission.write,
                owner: updatedPermission.owner,
              },
            },
          })
        } else {
          mutateDeny({
            data: {
              accessKeyId: updatedPermission.accessKeyId,
              bucketId: bucketInfo.id,
              permissions: {
                read: !updatedPermission.read,
                write: !updatedPermission.write,
                owner: !updatedPermission.owner,
              },
            },
          })
        }
      },
    [form, bucketInfo.id, mutateAllow, mutateDeny],
  )

  const handleDenyKey = useCallback(
    (accessKeyId: string) => () => {
      mutateDeny({
        data: {
          accessKeyId,
          bucketId: bucketInfo.id,
          permissions: {
            read: true,
            write: true,
            owner: true,
          },
        },
      })
    },
    [bucketInfo.id, mutateDeny],
  )

  const isPending = useMemo(
    () => isAllowPending || isDenyPending,
    [isAllowPending, isDenyPending],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('accessKeyId', {
        header: 'Key ID',
        cell: ({ getValue }) => (
          <>
            <TooltipText content={<p>{getValue()}</p>}>
              <div className="flex gap-2 items-center">
                <span>{getValue()?.substring(0, 16)}...</span>
              </div>
            </TooltipText>
            <Copy content={getValue() ?? ''} />
          </>
        ),
      }),
      columnHelper.accessor('read', {
        header: 'Read',
        cell: ({ row }) => (
          <FormField
            disabled={isPending}
            control={form.control}
            name={`permissions.${row.index}.read`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={handleCheckboxPermissionChange(
                      row.index,
                      field,
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      }),
      columnHelper.accessor('write', {
        header: 'Write',
        cell: ({ row }) => (
          <FormField
            disabled={isPending}
            control={form.control}
            name={`permissions.${row.index}.write`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={handleCheckboxPermissionChange(
                      row.index,
                      field,
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      }),
      columnHelper.accessor('owner', {
        header: 'Owner',
        cell: ({ row }) => (
          <FormField
            disabled={isPending}
            control={form.control}
            name={`permissions.${row.index}.owner`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={handleCheckboxPermissionChange(
                      row.index,
                      field,
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      }),
      columnHelper.display({
        header: 'Remove',
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="icon"
            disabled={isPending}
            onClick={handleDenyKey(row.original.accessKeyId)}
          >
            <Trash2Icon />
          </Button>
        ),
      }),
    ],
    [form.control, handleCheckboxPermissionChange, isPending, handleDenyKey],
  )

  const table = useReactTable({
    data: permissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        className="flex flex-col gap-4"
      >
        <AppTable table={table} />
      </form>
    </Form>
  )
}

export { BucketKeysTable }
