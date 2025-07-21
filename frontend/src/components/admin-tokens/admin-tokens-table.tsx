import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2Icon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { AppTable } from '@/components/app-table.tsx'
import { Copy } from '@/components/composed/copy.tsx'
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
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useDeleteAdminToken } from '@/generated/orval/garage/admin-api-token/admin-api-token.ts'
import type { GetAdminTokenInfoResponse } from '@/generated/orval/garage/endpoints.schemas.ts'
import { formatInstant, formatRelativeTime } from '@/lib/date.ts'
import { extractError } from '@/lib/utils.tsx'

const columnHelper = createColumnHelper<GetAdminTokenInfoResponse>()

interface AdminTokensTableProps {
  adminTokens: GetAdminTokenInfoResponse[]
  onDelete: () => void
}

function AdminTokensTable({ adminTokens, onDelete }: AdminTokensTableProps) {
  const { mutate, isPending } = useDeleteAdminToken({
    mutation: {
      onSuccess: () => {
        onDelete()
        toast.success(`Admin token deleted`)
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const deleteAdminToken = useCallback(
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
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ getValue }) => (
          <>
            <div className="flex items-center">
              <span>{getValue()}</span>
              {getValue() ? <Copy content={getValue() ?? ''} /> : '/'}
            </div>
          </>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
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
      columnHelper.accessor('created', {
        header: 'Created at',
        cell: ({ getValue }) => {
          const createdAt = getValue()
          return createdAt ? formatInstant(createdAt) : 'Never'
        },
      }),
      columnHelper.accessor('scope', {
        header: 'Scope',
        cell: ({ getValue }) => (
          <div className="flex flex-wrap gap-1">
            {getValue().map((scope) => (
              <Badge key={scope}>{scope}</Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Delete',
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                disabled={isPending || row.original.id == null}
              >
                <Trash2Icon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  "{row.getValue('name')}" admin token.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={() => deleteAdminToken(row.getValue('id'))}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      }),
    ],
    [deleteAdminToken, isPending],
  )

  const table = useReactTable({
    data: adminTokens,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <AppTable table={table} />
}

export { AdminTokensTable }
