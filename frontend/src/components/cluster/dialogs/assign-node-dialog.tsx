import { AssignNodeForm } from '@/components/cluster/forms/assign-node-form.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import type { DialogProps } from '@/types/dialog-props.ts'

interface AssignNodeDialogProps extends DialogProps {
  nodeId: string
  onAssign: () => void
}

function AssignNodeDialog({
  nodeId,
  onAssign,
  open,
  onOpenChange,
}: AssignNodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign node</DialogTitle>
        </DialogHeader>
        <AssignNodeForm nodeId={nodeId} onAssign={onAssign} />
      </DialogContent>
    </Dialog>
  )
}

export { AssignNodeDialog }
