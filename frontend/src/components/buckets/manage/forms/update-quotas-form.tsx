import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebounceCallback } from 'usehooks-ts'
import { z } from 'zod'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useUpdateBucket } from '@/generated/orval/garage/bucket/bucket.ts'
import { asBytes, convertBytes, type UnitLabel, units } from '@/lib/units.ts'
import { extractError } from '@/lib/utils.tsx'
import { Checkbox } from '../../../ui/checkbox.tsx'

const formSchema = z.object({
  enabled: z.boolean(),
  maxObjects: z
    .union([
      z.coerce
        .number()
        .nonnegative()
        .transform((val) => (Number.isNaN(val) ? null : val)),
      z.null(),
    ])
    .optional(),
  maxSize: z.union([
    z.object({
      value: z.union([
        z.coerce.number().int().nonnegative() as unknown as z.ZodNumber,
        z.null(),
      ]),
      unit: z.enum(
        units.map((unit) => unit.label) as [UnitLabel, ...UnitLabel[]],
      ),
    }),
    z.null(),
  ]),
})

type FormData = z.infer<typeof formSchema>

interface UpdateQuotasFormProps {
  bucketId: string
  defaultValues: {
    enabled: boolean
    maxSize?: number | null
    maxObjects?: number | null
  }
  onClose(): void
}

function UpdateQuotasForm({
  bucketId,
  defaultValues,
  onClose,
}: UpdateQuotasFormProps) {
  const defaultMaxSize = useMemo(
    () => convertBytes(defaultValues.maxSize ?? null),
    [defaultValues.maxSize],
  )

  const internalDefaultValues = useMemo(
    () => ({
      ...defaultValues,
      maxObjects: defaultValues.maxObjects ?? null,
      maxSize: defaultMaxSize,
    }),
    [defaultMaxSize, defaultValues],
  )

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: internalDefaultValues,
  })

  const { mutate } = useUpdateBucket({
    mutation: {
      onSuccess: () => {
        toast.success(`Updated bucket quotas`)
        onClose()
      },
      onError: (err) => {
        toast.error(extractError(err))
        form.reset(internalDefaultValues)
      },
    },
  })

  const onUpdate = useCallback(
    (
      quotas: {
        maxSize: number | null
        maxObjects: number | null
      } | null,
    ) => {
      if (
        quotas?.maxObjects === defaultValues.maxObjects &&
        quotas?.maxSize === defaultValues.maxSize
      ) {
        return
      }
      mutate({
        params: {
          id: bucketId,
        },
        data: {
          quotas,
        },
      })
    },
    [mutate, defaultValues, bucketId],
  )

  const onUpdateDebounced = useDebounceCallback(onUpdate, 500)

  useEffect(() => {
    const { unsubscribe } = form.watch((data) =>
      onUpdateDebounced(
        data.enabled
          ? {
              maxObjects: data.maxObjects ?? null,
              maxSize:
                data?.maxSize?.value == null || data?.maxSize.unit == null
                  ? null
                  : asBytes(data.maxSize.value, data.maxSize.unit),
            }
          : {
              maxObjects: null,
              maxSize: null,
            },
      ),
    )
    return unsubscribe
  }, [onUpdateDebounced, form])

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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="maxSize.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : Number(value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSize.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map(({ label }) => (
                          <SelectItem key={label} value={label}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="maxObjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max objects</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? null : Number(value))
                      }}
                    />
                  </FormControl>
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

export { UpdateQuotasForm }
