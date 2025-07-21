import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
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
import { useCreateBucket } from '@/generated/orval/garage/bucket/bucket.ts'
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
  z.object({
    type: z.literal('none'),
  }),
])

type FormData = z.infer<typeof formSchema>

interface CreateKeyFormProps {
  onCreate: () => void
}

function CreateBucketForm({ onCreate }: CreateKeyFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const { isPending, mutate } = useCreateBucket({
    mutation: {
      onSuccess: () => {
        const values = form.getValues()
        const aliasName = (() => {
          switch (values.type) {
            case 'global':
              return values.alias.globalAlias
            case 'local':
              return values.alias.localAlias
            case 'none':
              return 'Unnamed'
          }
        })()
        form.reset()
        toast.success(`Bucket "${aliasName}" created`)
        onCreate()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const createBucket = useCallback(
    async (data: FormData) => {
      const payload = (() => {
        switch (data.type) {
          case 'global':
            return data.alias
          case 'local':
            return {
              localAlias: {
                accessKeyId: data.alias.accessKeyId,
                alias: data.alias.localAlias,
              },
            }
          case 'none':
            return {}
        }
      })()
      mutate({
        data: payload,
      })
    },
    [mutate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createBucket)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bucket alias type</FormLabel>
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
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="none" />
                    </FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
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
          Create bucket
        </Button>
      </form>
    </Form>
  )
}

export { CreateBucketForm }
