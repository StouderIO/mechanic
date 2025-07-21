import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { LoginForm } from '@/components/auth/forms/login.form.tsx'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const onLoginSuccess = useCallback(() => {
    navigate({ to: '/cluster' })
    toast.success('Logged in')
  }, [navigate])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-2xl">
        <LoginForm onLoggedIn={onLoginSuccess} />
      </div>
    </div>
  )
}
