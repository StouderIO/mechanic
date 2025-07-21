import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CheckIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { AppTable } from '@/components/app-table.tsx'
import { Copy } from '@/components/composed/copy.tsx'
import { Reveal } from '@/components/composed/reveal.tsx'
import { TooltipText } from '@/components/composed/tooltip-text.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button.tsx'
import { useDeleteKey } from '@/generated/orval/garage/access-key/access-key.ts'
import type { GetKeyInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'
import { formatInstant, formatRelativeTime } from '@/lib/date.ts'
import { extractError } from '@/lib/utils.tsx'

const columnHelper = createColumnHelper<GetKeyInfoResponse>()

interface KeysTableProps {
  keys: GetKeyInfoResponse[]
  onDelete: () => void
}

function KeysTable({ keys, onDelete }: KeysTableProps) {
  const { mutate, isPending } = useDeleteKey({
    mutation: {
      onSuccess: () => {
        onDelete()
        toast.success(`Key deleted`)
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const deleteKey = useCallback(
    (id: string) => {
      mutate({
        params: {
          id,
        },
      })
    },
    [mutate],
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
      columnHelper.accessor('secretAccessKey', {
        header: 'Secret key',
        cell: ({ getValue }) => (
          <Reveal>
            <TooltipText content={<p>{getValue()}</p>}>
              <div className="flex gap-2 items-center">
                <span>{getValue()?.substring(0, 16)}...</span>
                <Copy content={getValue() ?? ''} />
              </div>
            </TooltipText>
          </Reveal>
        ),
      }),
      columnHelper.accessor('expiration', {
        header: 'Expiration',
        cell: ({ getValue }) => {
          const expiration = getValue()
          return expiration != null ? (
            <TooltipText content={formatInstant(expiration)}>
              {formatRelativeTime(Temporal.Instant.from(expiration))}
            </TooltipText>
          ) : (
            'Never'
          )
        },
      }),
      columnHelper.accessor('permissions.createBucket', {
        header: 'Can create bucket?',
        cell: ({ getValue }) => (getValue() ? <CheckIcon /> : <XIcon />),
      }),
      columnHelper.accessor('created', {
        header: 'Created at',
        cell: ({ getValue }) => {
          const createdAt = getValue()
          return createdAt ? formatInstant(createdAt) : 'Never'
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Delete',
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2Icon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  "{row.getValue('name')}" access key.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={() => deleteKey(row.getValue('accessKeyId'))}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      }),
    ],
    [deleteKey, isPending],
  )

  const table = useReactTable({
    data: keys,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <AppTable table={table} />
}

export { KeysTable }
