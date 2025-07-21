import { zodResolver } from '@hookform/resolvers/zod'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AppTable } from '@/components/app-table.tsx'
import { Copy } from '@/components/composed/copy.tsx'
import { TooltipText } from '@/components/composed/tooltip-text'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form.tsx'
import type { GetBucketInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'
import { useAllowBucketKey } from '@/generated/orval/garage/permission/permission.ts'
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

interface AllowKeyFormProps {
  permissions: Permission[]
  bucketInfo: GetBucketInfoResponse
  onAllowed: () => void
}

function AllowKeyForm({
  permissions,
  bucketInfo,
  onAllowed,
}: AllowKeyFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { permissions: permissions },
  })

  const { isPending, mutate } = useAllowBucketKey({
    mutation: {
      onError: (err) => toast.error(extractError(err)),
    },
  })

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
            control={form.control}
            name={`permissions.${row.index}.read`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
            control={form.control}
            name={`permissions.${row.index}.write`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
            control={form.control}
            name={`permissions.${row.index}.owner`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      }),
    ],
    [form.control],
  )

  const table = useReactTable({
    data: permissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const allowKey = useCallback(
    (data: FormData) => {
      data.permissions
        .filter(
          (permission) =>
            permission.read || permission.write || permission.owner,
        )
        .forEach((permission) =>
          mutate({
            data: {
              accessKeyId: permission.accessKeyId,
              bucketId: bucketInfo.id,
              permissions: {
                read: permission.read,
                write: permission.write,
                owner: permission.owner,
              },
            },
          }),
        )

      toast.success(`Keys allowed`)
      form.reset()
      onAllowed()
    },
    [mutate, bucketInfo.id, form, onAllowed],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(allowKey)}
        className="flex flex-col gap-4"
      >
        <AppTable table={table} />
        <Button type="submit" disabled={isPending}>
          Allow keys
        </Button>
      </form>
    </Form>
  )
}
export { AllowKeyForm }
