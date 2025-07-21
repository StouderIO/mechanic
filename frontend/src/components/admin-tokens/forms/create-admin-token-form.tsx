import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button.tsx'
import { DatetimePicker } from '@/components/ui/datetime-picker.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/ui/multi-selector.tsx'
import { useCreateAdminToken } from '@/generated/orval/garage/admin-api-token/admin-api-token.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.object({
  name: z.string().optional(),
  expiration: z.iso.datetime().optional(),
  scope: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

const availablesScopes = [
  '*',
  'AddBucketAlias',
  'AllowBucketKey',
  'ApplyClusterLayout',
  'CleanupIncompleteUploads',
  'ClusterLayoutSkipDeadNodes',
  'ConnectClusterNodes',
  'CreateAdminToken',
  'CreateBucket',
  'CreateKey',
  'CreateMetadataSnapshot',
  'DeleteAdminToken',
  'DeleteBucket',
  'DeleteKey',
  'DenyBucketKey',
  'GetAdminTokenInfo',
  'GetBlockInfo',
  'GetBucketInfo',
  'GetClusterHealth',
  'GetClusterLayout',
  'GetClusterLayoutHistory',
  'GetClusterStatistics',
  'GetClusterStatus',
  'GetCurrentAdminTokenInfo',
  'GetKeyInfo',
  'GetNodeInfo',
  'GetNodeStatistics',
  'GetWorkerInfo',
  'GetWorkerVariable',
  'ImportKey',
  'InspectObject',
  'LaunchRepairOperation',
  'ListAdminTokens',
  'ListBlockErrors',
  'ListBuckets',
  'ListKeys',
  'ListWorkers',
  'PreviewClusterLayoutChanges',
  'PurgeBlocks',
  'RemoveBucketAlias',
  'RetryBlockResync',
  'RevertClusterLayout',
  'SetWorkerVariable',
  'UpdateAdminToken',
  'UpdateBucket',
  'UpdateClusterLayout',
  'UpdateKey',
] as const

interface CreateAdminTokenFormProps {
  onCreate: () => void
}

function CreateAdminTokenForm({ onCreate }: CreateAdminTokenFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      expiration: undefined,
      scope: [],
    },
  })

  const { isPending, mutate } = useCreateAdminToken({
    mutation: {
      onSuccess: () => {
        toast.success(`Key "${form.getValues().name ?? 'Unnamed key'}" created`)
        form.reset()
        onCreate()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const createAdminToken = useCallback(
    (data: FormData) =>
      mutate({
        data,
      }),
    [mutate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createAdminToken)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Unnamed key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="datetime">Expiration</FormLabel>
              <FormControl>
                <DatetimePicker
                  onChange={field.onChange}
                  dtOptions={{
                    hour12: false,
                  }}
                  format={[
                    ['days', 'months', 'years'],
                    ['hours', 'minutes', 'seconds'],
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope</FormLabel>
              <MultiSelector
                onValuesChange={field.onChange}
                values={field.value}
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder="Select admin token scope" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {availablesScopes.map((scope) => (
                      <MultiSelectorItem key={scope} value={scope}>
                        <span>{scope}</span>
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          Create admin token
        </Button>
      </form>
    </Form>
  )
}

export { CreateAdminTokenForm }
