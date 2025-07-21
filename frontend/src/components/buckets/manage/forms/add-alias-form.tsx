import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import { useAddBucketAlias } from '@/generated/orval/garage/bucket-alias/bucket-alias.ts'
import type { BucketAliasEnum } from '@/generated/orval/garage/endpoints.schemas.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('global'),
    alias: z.object({
      globalAlias: z.string(),
    }),
  }),
  z.object({
    type: z.literal('local'),
    alias: z.object({
      localAlias: z.string(),
      accessKeyId: z.string(),
    }),
  }),
])

type FormData = z.infer<typeof formSchema>

interface AddAliasFormProps {
  bucketId: string
  onClose: () => void
}

function AddAliasForm({ bucketId, onClose }: AddAliasFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'global',
    },
  })

  const { isPending, mutate } = useAddBucketAlias({
    mutation: {
      onSuccess: () => {
        const values = form.getValues().alias
        const aliasName =
          'globalAlias' in values ? values.globalAlias : values.localAlias
        form.reset()
        onClose()
        toast.success(`Bucket alias "${aliasName}" created`)
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const addAlias = useCallback(
    async (alias: BucketAliasEnum) => {
      mutate({
        data: {
          bucketId,
          ...alias,
        },
      })
    },
    [bucketId, mutate],
  )

  const onSubmit = useCallback(
    (data: FormData) => addAlias(data.alias),
    [addAlias],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="global" />
                    </FormControl>
                    <FormLabel className="font-normal">Global</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="local" />
                    </FormControl>
                    <FormLabel className="font-normal">Local</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                {form.watch('type') === 'global' &&
                  'Global alias is visible to every keys. '}
                {form.watch('type') === 'local' &&
                  'Local alias is assigned to a specific key.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('type') === 'global' && (
          <FormField
            control={form.control}
            name="alias.globalAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Global Alias</FormLabel>
                <FormControl>
                  <Input placeholder="Enter global alias" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('type') === 'local' && (
          <>
            <FormField
              control={form.control}
              name="alias.localAlias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter local alias" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alias.accessKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter key ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isPending}>
          Create alias
        </Button>
      </form>
    </Form>
  )
}

export { AddAliasForm }
