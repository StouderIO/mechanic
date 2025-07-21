import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, InfoIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConnectNodeDialog } from '@/components/cluster/dialogs/connect-node-dialog.tsx'
import { type Node, NodesTable } from '@/components/cluster/nodes-table.tsx'
import { PageError } from '@/components/composed/page-error.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner.tsx'
import { getClusterStatus } from '@/generated/orval/garage/cluster/cluster.ts'
import {
  getClusterLayout,
  useApplyClusterLayout,
  useRevertClusterLayout,
  useUpdateClusterLayout,
} from '@/generated/orval/garage/cluster-layout/cluster-layout.ts'
import { extractError } from '@/lib/utils.tsx'

export const Route = createFileRoute('/_pathlessLayout/cluster/')({
  component: ClusterPage,
  loader: () =>
    Promise.all([getClusterStatus(), getClusterLayout()]).then(
      ([status, layout]) => ({ status, layout }),
    ),
  errorComponent: ({ error }) => (
    <PageError title="Error while loading cluster status" error={error} />
  ),
  pendingComponent: () => <Spinner />,
})

function ClusterPage() {
  const navigate = Route.useNavigate()
  const refresh = useCallback(() => navigate({ to: '.' }), [navigate])

  const { status, layout } = Route.useLoaderData()

  const nodes = useMemo(
    () =>
      status.nodes.map((node) => {
        const stagedChanges = layout.stagedRoleChanges.find(
          (roleChange) => roleChange.id === node.id,
        )
        return {
          ...node,
          isStaged: stagedChanges !== undefined,
        } as Node
      }),
    [layout.stagedRoleChanges, status.nodes],
  )

  const [applyMessages, setApplyMessages] = useState<string[]>([])
  const clearMessages = useCallback(() => setApplyMessages([]), [])
  const { mutate: mutateApply, isPending: isApplyPending } =
    useApplyClusterLayout({
      mutation: {
        onSuccess: async (data) => {
          setApplyMessages(data.message)
          toast.success(`Layout v${data.layout.version} applied`)
          await refresh()
        },
        onError: (err) => toast.error(extractError(err)),
      },
    })
  const { mutate: mutateRevert, isPending: isRevertPending } =
    useRevertClusterLayout({
      mutation: {
        onSuccess: async () => {
          toast.success(`Layout reverted`)
          await refresh()
        },
        onError: (err) => toast.error(extractError(err)),
      },
    })

  const { mutate: unassignMutate } = useUpdateClusterLayout({
    mutation: {
      onSuccess: async () => {
        toast.success(`Node unassigned`)
        await refresh()
      },
      onError: (err) => {
        toast.error(extractError(err))
      },
    },
  })

  const apply = useCallback(
    () =>
      mutateApply({
        data: {
          version: status.layoutVersion + 1,
        },
      }),
    [status.layoutVersion, mutateApply],
  )
  const revert = useCallback(() => mutateRevert(), [mutateRevert])
  const unassignNode = useCallback(
    (nodeId: string) =>
      unassignMutate({
        data: {
          roles: [
            {
              id: nodeId,
              remove: true,
            },
          ],
        },
      }),
    [unassignMutate],
  )

  const layoutActionPending = useMemo(
    () => isApplyPending || isRevertPending,
    [isApplyPending, isRevertPending],
  )

  const hasStagedChanges = useMemo(
    () => layout.stagedRoleChanges.length > 0,
    [layout.stagedRoleChanges.length],
  )

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex gap-4 items-center justify-between">
        {hasStagedChanges ? (
          <Alert className="w-fit">
            <InfoIcon />
            <AlertTitle>Staged layout changes</AlertTitle>
            <AlertDescription>
              There are staged layout changes that need to be applied. Press
              Apply to apply them, or Revert to discard them.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="w-full"></div>
        )}
        {hasStagedChanges ? (
          <div className="flex gap-2 ">
            <Button
              variant="destructive"
              disabled={layoutActionPending}
              onClick={revert}
            >
              Revert
            </Button>
            <Button disabled={layoutActionPending} onClick={apply}>
              Apply
            </Button>
          </div>
        ) : (
          <ConnectNodeDialog onConnect={refresh} />
        )}
      </div>
      {applyMessages.length > 0 && (
        <Alert className="w-fit" onClick={clearMessages}>
          <CheckCircle />
          <AlertTitle>Layout applied</AlertTitle>
          <AlertDescription>
            <pre>{applyMessages.join('\n')}</pre>
          </AlertDescription>
        </Alert>
      )}

      <NodesTable nodes={nodes} onAssign={refresh} onUnassign={unassignNode} />
    </div>
  )
}
