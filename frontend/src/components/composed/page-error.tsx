import { AlertCircleIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'

interface PageErrorProps {
  title: ReactNode
  error: { message?: string; response?: { data?: { message?: string } } }
}

function PageError({ title, error }: PageErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {error?.response?.data?.message ?? error?.message ?? 'Unknown error'}
      </AlertDescription>
    </Alert>
  )
}

export { PageError }
