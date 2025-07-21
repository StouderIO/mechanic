import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { PageError } from '@/components/composed/page-error.tsx'
import { CreateKeyDialog } from '@/components/keys/dialogs/create-key-dialog.tsx'
import { KeysTable } from '@/components/keys/keys-table.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import {
  getKeyInfo,
  listKeys,
} from '@/generated/orval/garage/access-key/access-key.ts'

export const Route = createFileRoute('/_pathlessLayout/keys/')({
  component: KeysPage,
  loader: async () => ({
    keys: await listKeys().then((data) =>
      Promise.all(
        data.map(({ id }) => getKeyInfo({ id, showSecretKey: true })),
      ),
    ),
  }),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading keys" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function KeysPage() {
  const { keys } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const refresh = useCallback(() => navigate({ to: '.' }), [navigate])

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-row-reverse">
        <CreateKeyDialog onCreate={refresh} />
      </div>
      <KeysTable keys={keys} onDelete={refresh} />
    </div>
  )
}
