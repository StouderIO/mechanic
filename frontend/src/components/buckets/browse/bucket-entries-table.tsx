import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  getCoreRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArchiveIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  TrashIcon,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { AppTable } from '@/components/app-table.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useDeleteBucketFile } from '@/generated/orval/mechanic/bucket-browser-controller/bucket-browser-controller.ts'
import { formatInstant } from '@/lib/date.ts'
import { bytesFormatter, extname, extractError } from '@/lib/utils.tsx'
import type { BucketEntry } from '@/types/bucket-entry.ts'

interface BucketEntriesTableProps {
  bucketId: string
  entries: BucketEntry[]
  currentPath: string
  onFileDelete: () => void
  onFolderClick: (name: string) => void
}

const columnHelper = createColumnHelper<BucketEntry>()

function BucketEntriesTable({
  bucketId,
  entries,
  currentPath,
  onFileDelete,
  onFolderClick,
}: BucketEntriesTableProps) {
  const { mutate, isPending } = useDeleteBucketFile({
    mutation: {
      onSuccess: () => {
        onFileDelete()
        toast.success(`File deleted`)
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const deleteFile = useCallback(
    (path: string) =>
      mutate({ bucketId, params: { path: currentPath + path } }),
    [mutate, bucketId, currentPath],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'Icon',
        cell: ({ row }) => {
          const { type, name } = row.original
          if (type === 'FOLDER') {
            return <FolderIcon />
          }

          const ext = extname(name)
          if (
            [
              '.zip',
              '.rar',
              '.7z',
              '.iso',
              '.tar',
              '.gz',
              '.gzip',
              '.bz2',
              '.xz',
              '.lzma',
            ].includes(ext)
          )
            return <ArchiveIcon />

          if (
            [
              '.jpg',
              '.jpeg',
              '.png',
              '.gif',
              '.bmp',
              '.webp',
              '.tiff',
              '.tif',
              '.ico',
              '.svg',
              '.heic',
              '.heif',
              '.avif',
            ].includes(ext)
          )
            return <ImageIcon />

          return <FileIcon />
        },
      }),
      columnHelper.accessor('name', {
        header: 'Name',
      }),
      columnHelper.accessor('size', {
        header: 'Size',
        cell: ({ getValue }) => {
          const value = getValue()
          return <>{value != null ? bytesFormatter(value) : ''}</>
        },
      }),
      columnHelper.accessor('lastModified', {
        header: 'Last modified',
        cell: ({ getValue }) => {
          const value = getValue()
          return <>{value === undefined ? '' : formatInstant(value)}</>
        },
      }),
      columnHelper.display({
        header: 'Actions',
        cell: ({ row }) =>
          row.original.type === 'FILE' && (
            <DropdownMenu>
              <DropdownMenuTrigger className="block">
                <EllipsisVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    target="_blank"
                    to={
                      `/api/buckets/${bucketId}/file?path=${currentPath}${row.original.name}` as unknown as string
                    }
                  >
                    <DownloadIcon /> Download
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteFile(row.original.name)}
                  disabled={isPending}
                >
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
      }),
    ],
    [bucketId, currentPath, deleteFile, isPending],
  )

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const onRowClick = useCallback(
    async (row: Row<BucketEntry>) => {
      if (row.original.type === 'FOLDER') {
        onFolderClick(row.original.name)
      }
    },
    [onFolderClick],
  )

  return <AppTable table={table} onRowClick={onRowClick} />
}

export { BucketEntriesTable }
