import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
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
} from '@/components/ui/select'
import { TagsInput } from '@/components/ui/tags-input.tsx'
import { useUpdateClusterLayout } from '@/generated/orval/garage/cluster-layout/cluster-layout.ts'
import { getFactor, units } from '@/lib/units.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.discriminatedUnion('isGateway', [
  z.object({
    nodeId: z.string(),
    zone: z.string(),
    tags: z.array(z.string()),
    isGateway: z.literal(true),
  }),
  z.object({
    nodeId: z.string(),
    zone: z.string(),
    tags: z.array(z.string()),
    isGateway: z.literal(false),
    capacity: z.coerce.number().int().nonnegative() as unknown as z.ZodNumber,
    capacityUnit: z.enum(units.map((unit) => unit.label)),
  }),
])

type FormData = z.infer<typeof formSchema>

interface ConnectNodeFormProps {
  nodeId: string
  onAssign: () => void
}

function AssignNodeForm({ nodeId, onAssign }: ConnectNodeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodeId,
      tags: [],
      isGateway: false,
    },
  })

  const { mutate: mutateClusterLayout } = useUpdateClusterLayout({
    mutation: {
      onSuccess: async () => {
        toast.success(`Change staged`)
        form.reset()
        onAssign()
      },
      onError: (err) => {
        toast.error(extractError(err))
      },
    },
  })

  const assignNode = useCallback(
    (data: FormData) => {
      mutateClusterLayout({
        data: {
          roles: [
            {
              id: nodeId,
              zone: data.zone,
              tags: data.tags,
              ...(data.isGateway
                ? { capacity: null }
                : {
                    capacity:
                      getFactor(data.capacityUnit) *
                      parseInt(data.capacity as unknown as string, 10),
                  }),
            },
          ],
        },
      })
    },
    [mutateClusterLayout, nodeId],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(assignNode)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="nodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Node ID</FormLabel>
              <FormControl>
                <Input type="text" disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zone</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <TagsInput value={field.value} onValueChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isGateway"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  defaultChecked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Gateway</FormLabel>
            </FormItem>
          )}
        />

        {form.watch('isGateway') === false && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacityUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
        )}

        <Button type="submit">Assign node</Button>
      </form>
    </Form>
  )
}

export { AssignNodeForm }
