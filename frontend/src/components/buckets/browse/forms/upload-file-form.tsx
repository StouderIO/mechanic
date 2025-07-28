import { zodResolver } from '@hookform/resolvers/zod'
import { TrashIcon } from 'lucide-react'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone'
import { uploadBucketFiles } from '@/generated/orval/mechanic/bucket-browser-controller/bucket-browser-controller.ts'
import { extractError } from '@/lib/utils.tsx'

const formSchema = z.object({
  prefix: z.string().optional(),
  files: z.array(
    z.instanceof(File).refine((file: File) => file.size > 0, {
      message: 'Please select one or more files to upload.',
    }),
  ),
})

type FormData = z.infer<typeof formSchema>

interface UploadFileFormProps {
  bucketId: string
  path: string
  onUploaded: () => void
}

function UploadFileForm({ bucketId, path, onUploaded }: UploadFileFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prefix: undefined,
      files: [],
    },
  })

  const onFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      form.setValue('files', acceptedFiles)
    },
    [form],
  )

  const onFileDropError = useCallback(
    (error: Error) => {
      form.setError('files', { message: error.message })
    },
    [form],
  )

  const removeFile = useCallback(
    (file: File) => {
      const currentFiles = form.getValues('files')
      const updatedFiles = currentFiles.filter((f) => f.name !== file.name)
      form.setValue('files', updatedFiles)
    },
    [form],
  )

  const submitUpload = useCallback(
    async ({ prefix, files }: FormData) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      try {
        const cleanPrefix = prefix?.replace(/\/$/, '').replace(/^\//, '')
        await uploadBucketFiles(
          bucketId,
          {
            path:
              path === '' && cleanPrefix
                ? cleanPrefix
                : `${path}/${cleanPrefix}`,
            files: [],
          },
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData,
          },
        )
      } catch (err) {
        return toast.error(extractError(err))
      }

      form.reset()
      toast.success(`Files uploaded successfully.`)
      onUploaded()
    },
    [bucketId, path, form, onUploaded],
  )

  const files = form.watch('files')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitUpload)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="prefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prefix</FormLabel>
              <FormControl>
                <Input placeholder="Enter files prefix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={() => (
            <FormItem>
              <FormLabel>Files</FormLabel>
              <Dropzone multiple onDrop={onFileDrop} onError={onFileDropError}>
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
              <FormMessage />
            </FormItem>
          )}
        />
        {files.length > 0 && (
          <>
            <Button type="submit">Upload files</Button>
            <div className="flex flex-col gap-1">
              {files.map((file) => (
                <div key={file.name} className="flex gap-2">
                  <div
                    key={file.name}
                    className="rounded-md border px-4 py-2 font-mono text-sm w-full overflow-ellipsis whitespace-nowrap"
                  >
                    {file.name}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFile(file)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </form>
    </Form>
  )
}

export { UploadFileForm }
