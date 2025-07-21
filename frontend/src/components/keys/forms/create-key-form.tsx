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
import { Switch } from '@/components/ui/switch.tsx'
import { useCreateKey } from '@/generated/orval/garage/access-key/access-key.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.object({
  name: z.string().optional(),
  expiration: z.iso.datetime().optional(),
  allow: z.object({
    createBucket: z.boolean(),
  }),
})

type FormData = z.infer<typeof formSchema>

interface CreateKeyFormProps {
  onCreate: () => void
}

function CreateKeyForm({ onCreate }: CreateKeyFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      expiration: undefined,
      allow: {
        createBucket: false,
      },
    },
  })

  const { isPending, mutate } = useCreateKey({
    mutation: {
      onSuccess: () => {
        toast.success(`Key "${form.getValues().name ?? 'Unnamed key'}" created`)
        form.reset()
        onCreate()
      },
      onError: (err) => toast.error(extractError(err)),
    },
  })

  const createKey = useCallback(
    (data: FormData) =>
      mutate({
        data,
      }),
    [mutate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createKey)}
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
            <FormItem className="flex w-72 flex-col gap-2">
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
          name="allow.createBucket"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Can create bucket
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          Create alias
        </Button>
      </form>
    </Form>
  )
}

export { CreateKeyForm }
