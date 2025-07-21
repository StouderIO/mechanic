import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { AdminTokensTable } from '@/components/admin-tokens/admin-tokens-table.tsx'
import { CreateAdminTokenDialog } from '@/components/admin-tokens/dialogs/create-admin-token-dialog.tsx'
import { PageError } from '@/components/composed/page-error.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { listAdminTokens } from '@/generated/orval/garage/admin-api-token/admin-api-token.ts'

export const Route = createFileRoute('/_pathlessLayout/admin-tokens/')({
  component: AdminTokensPage,
  loader: async () => ({
    adminTokens: await listAdminTokens(),
  }),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading admin tokens" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function AdminTokensPage() {
  const { adminTokens } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const refresh = useCallback(() => navigate({ to: '.' }), [navigate])

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-row-reverse">
        <CreateAdminTokenDialog onCreate={refresh} />
      </div>
      <AdminTokensTable adminTokens={adminTokens} onDelete={refresh} />
    </div>
  )
}
