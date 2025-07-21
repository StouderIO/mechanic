import { Link, useNavigate } from '@tanstack/react-router'
import { Fragment, type ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import AppSidebar from '@/components/app-sidebar.tsx'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { useLogout } from '@/generated/orval/mechanic/auth-controller/auth-controller.ts'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs.ts'

interface AppLayoutProps {
  children: ReactNode
}
function AppLayout({ children }: AppLayoutProps) {
  const breadcrumbs = useBreadcrumbs()

  const navigate = useNavigate()

  const { mutate, isPending } = useLogout({
    mutation: {
      onSuccess: () => {
        navigate({ to: '/auth/login' }).then(() => toast.success('Logged out'))
      },
    },
  })

  const logout = useCallback(() => mutate(), [mutate])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
          <div className="w-full flex items-center gap-2">
            <SidebarTrigger />
            <Breadcrumb className="shrink-0">
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <Fragment key={breadcrumb.crumb}>
                    <BreadcrumbItem className="hidden md:block">
                      {breadcrumb.url ? (
                        <BreadcrumbLink asChild>
                          <Link to={breadcrumb.url}>{breadcrumb.crumb}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.crumb}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index !== breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button disabled={isPending} onClick={logout}>
            Logout
          </Button>
        </header>
        <div className="p-4 w-full h-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppLayout }
