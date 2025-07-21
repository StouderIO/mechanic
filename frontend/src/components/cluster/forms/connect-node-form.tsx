import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useConnectClusterNodes } from '@/generated/orval/garage/cluster/cluster.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.object({
  nodeId: z.string(),
  netAddress: z.string(),
})

type FormData = z.infer<typeof formSchema>

interface ConnectNodeFormProps {
  onConnect: () => void
}

function ConnectNodeForm({ onConnect }: ConnectNodeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  const { mutate, isPending } = useConnectClusterNodes({
    mutation: {
      onSuccess: ([data]) => {
        if (!data.success) {
          toast.error(data.error)
          return
        }

        form.reset()
        toast.success(`Cluster node connected`)
        onConnect()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const connectNode = useCallback(
    ({ nodeId, netAddress }: FormData) => {
      const connectString = `${nodeId}@${netAddress}`
      mutate({
        data: [connectString],
      })
    },
    [mutate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(connectNode)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="nodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Node ID</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="netAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Net address</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Connect node
        </Button>
      </form>
    </Form>
  )
}

export { ConnectNodeForm }
