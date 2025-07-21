import { type ClassValue, clsx } from 'clsx'
import prettyBytes from 'pretty-bytes'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bytesFormatter(value: number) {
  return prettyBytes(value, { locale: true })
}

export function numberFormatter(value: number) {
  return value.toLocaleString()
}

export function debug(data: any) {
  toast('You printed the following values', {
    description: (
      <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}

export function extractError(error: any) {
  return error?.response.data.message
}

export function extname(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return ''
  }
  return fileName.slice(lastDotIndex)
}
