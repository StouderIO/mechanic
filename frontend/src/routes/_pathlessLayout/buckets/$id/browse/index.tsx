import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { BucketEntriesTable } from '@/components/buckets/browse/bucket-entries-table.tsx'
import { PageError } from '@/components/composed/page-error.tsx'

import { Spinner } from '@/components/ui/spinner.tsx'
import { listBucketFiles } from '@/generated/orval/mechanic/bucket-browser-controller/bucket-browser-controller.ts'
import type { BucketEntry } from '@/types/bucket-entry.ts'

const browseSearchSchema = z.object({
  path: z.string().default(''),
})

export const Route = createFileRoute('/_pathlessLayout/buckets/$id/browse/')({
  component: BrowsePage,
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ params, deps: { path } }) => ({
    entries: await listBucketFiles(params.id, {
      path: path.length === 0 ? '' : path,
    }).then((response) => response.files),
  }),
  errorComponent: ({ error }) => (
    <PageError title="Error while browsing bucket" error={error} />
  ),
  pendingComponent: () => <Spinner />,
  validateSearch: browseSearchSchema,
})

function BrowsePage() {
  const { entries } = Route.useLoaderData()
  const { path } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { id: bucketId } = Route.useParams()

  const normalizedEntries = useMemo(
    () =>
      [
        ...(path === '' ? [] : [{ type: 'FOLDER' as const, name: '..' }]),
        ...entries.map(
          (entry) =>
            ({
              type: entry.type,
              name: entry.path.replace(path, '').replace(/\/$/, ''),
              size: 'size' in entry ? entry.size : undefined,
              lastModified:
                'lastModified' in entry ? entry.lastModified : undefined,
            }) as BucketEntry,
        ),
      ].sort((a, b) => {
        if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1
        if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1
        return a.name.localeCompare(b.name)
      }),
    [entries, path],
  )

  const onFileDelete = useCallback(
    () =>
      navigate({
        to: '.',
        search: { path },
      }),
    [navigate, path],
  )

  const onFolderClick = useCallback(
    async (name: string) => {
      const parentPath = `${path.split('/').slice(0, -2).join('/')}`
      const rootEmptyParentPath = parentPath === '' ? '' : `${parentPath}/`
      const realPath = name === '..' ? rootEmptyParentPath : `${path}${name}/`
      await navigate({
        to: '/buckets/$id/browse',
        search: { path: realPath },
      })
    },
    [navigate, path],
  )

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-row-reverse">XXX</div>
      <BucketEntriesTable
        bucketId={bucketId}
        entries={normalizedEntries}
        currentPath={path}
        onFileDelete={onFileDelete}
        onFolderClick={onFolderClick}
      />
    </div>
  )
}
