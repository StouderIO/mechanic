import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebounceCallback } from 'usehooks-ts'
import { z } from 'zod'
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
import { useUpdateBucket } from '@/generated/orval/garage/bucket/bucket.ts'
import { extractError } from '@/lib/utils.tsx'
import { Checkbox } from '../../../ui/checkbox.tsx'

const formSchema = z.object({
  enabled: z.boolean(),
  indexDocument: z.string().optional(),
  errorDocument: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface UpdateWebsiteFormProps {
  bucketId: string
  defaultValues: FormData
  onClose(): void
}

function UpdateWebsiteForm({
  bucketId,
  defaultValues,
  onClose,
}: UpdateWebsiteFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { mutate } = useUpdateBucket({
    mutation: {
      onSuccess: () => {
        toast.success(`Updated website config`)
        onClose()
      },
      onError: (err) => {
        toast.error(extractError(err))
        form.reset(defaultValues)
      },
    },
  })

  const onUpdate = useCallback(
    (data: FormData) => {
      if (
        data.enabled === defaultValues.enabled &&
        data.indexDocument === defaultValues.indexDocument &&
        data.errorDocument === defaultValues.errorDocument
      ) {
        return
      }
      mutate({
        params: {
          id: bucketId,
        },
        data: {
          websiteAccess: data,
        },
      })
    },
    [mutate, defaultValues, bucketId],
  )

  const onUpdateDebounced = useDebounceCallback(onUpdate, 1000)

  useEffect(() => {
    const { unsubscribe } = form.watch((data) =>
      onUpdateDebounced(
        data.enabled
          ? {
              enabled: true,
              indexDocument: data.indexDocument ?? '',
              errorDocument: data.errorDocument ?? '',
            }
          : {
              enabled: false,
            },
      ),
    )
    return unsubscribe
  }, [onUpdateDebounced, form.watch])

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  defaultChecked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Enabled</FormLabel>
            </FormItem>
          )}
        />

        {form.watch('enabled') === true && (
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="indexDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Index document</FormLabel>
                  <FormControl>
                    <Input placeholder="index.html" {...field} />
                  </FormControl>
                  <FormDescription>Bucket index file</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="errorDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error document</FormLabel>
                  <FormControl>
                    <Input placeholder="error.html" {...field} />
                  </FormControl>
                  <FormDescription>
                    Error document shown on 404.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  )
}

export { UpdateWebsiteForm }
