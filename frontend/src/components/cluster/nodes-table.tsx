import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  EllipsisVerticalIcon,
  NetworkIcon,
  RouteIcon,
  RouteOffIcon,
} from 'lucide-react'
import prettyBytes from 'pretty-bytes'
import { useMemo, useState } from 'react'
import { AppTable } from '@/components/app-table.tsx'
import { AssignNodeDialog } from '@/components/cluster/dialogs/assign-node-dialog.tsx'
import { Copy } from '@/components/composed/copy.tsx'
import { TooltipText } from '@/components/composed/tooltip-text.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import type { NodeResp } from '@/generated/orval/garage/endpoints.schemas.ts'
import { formatRelativeTime } from '@/lib/date.ts'
import { Nbsp } from '@/lib/nbsp.tsx'

export type Node = NodeResp & { isStaged: boolean }

interface NodesTableProps {
  nodes: Node[]
  onAssign: (id: string) => void
  onUnassign: (id: string) => void
}

const columnHelper = createColumnHelper<Node>()

function NodesTable({ nodes, onAssign, onUnassign }: NodesTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
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
      columnHelper.accessor('hostname', {
        header: 'Hostname',
        cell: ({ row }) => (
          <div className="grid grid-cols-1">
            <div className="font-medium">
              {row.original.hostname ?? <Nbsp />}
            </div>
            <div className="flex">
              {row.original.addr ? (
                <>
                  <NetworkIcon size={16} />
                  {row.original.addr}
                </>
              ) : (
                <Nbsp />
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('role.zone', {
        header: 'Zone',
        cell: ({ row }) => (
          <div className="grid grid-cols-1">
            <div>{row.original.role?.zone}</div>
            <div>
              {row.original.role?.tags?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        ),
      }),

      columnHelper.accessor('role.capacity', {
        header: 'Capacity',
        cell: ({ getValue }) => (
          <div className="flex flex-row">
            {getValue() === null
              ? 'Gateway'
              : prettyBytes(BigInt(getValue() ?? 0))}
          </div>
        ),
      }),
      columnHelper.accessor('isUp', {
        header: 'Status',
        cell: ({ row }) => (
          <Tooltip>
            <TooltipContent>
              {formatRelativeTime(
                Temporal.Now.instant().subtract(
                  Temporal.Duration.from({
                    seconds: row.original.lastSeenSecsAgo ?? 0,
                  }),
                ),
              )}
            </TooltipContent>
            <TooltipTrigger>
              <Badge
                variant={
                  row.original.draining
                    ? 'warning'
                    : row.original.isUp
                      ? 'success'
                      : 'destructive'
                }
              >
                {row.original.draining
                  ? 'Draining'
                  : row.original.isUp
                    ? 'Active'
                    : 'Inactive'}
              </Badge>
            </TooltipTrigger>
          </Tooltip>
        ),
      }),
      columnHelper.display({
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => setAssignNodeId(row.original.id)}
              >
                <RouteIcon /> Assign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUnassign(row.original.id)}>
                <RouteOffIcon />
                Unassign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [onUnassign],
  )

  const table = useReactTable({
    data: nodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const [assignNodeId, setAssignNodeId] = useState<string | null>(null)

  return (
    <>
      <AppTable table={table} />

      {assignNodeId !== null && (
        <AssignNodeDialog
          nodeId={assignNodeId}
          onAssign={() => {
            onAssign(assignNodeId)
            setAssignNodeId(null)
          }}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setAssignNodeId(null)
            }
          }}
        />
      )}
    </>
  )
}

export { NodesTable }
