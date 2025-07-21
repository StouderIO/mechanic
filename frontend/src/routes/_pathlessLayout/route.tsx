import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppLayout } from '@/components/app-layout.tsx'
import { getMetaInfo } from '@/generated/orval/mechanic/meta-controller/meta-controller.ts'

export const Route = createFileRoute('/_pathlessLayout')({
  component: PathlessLayoutRoute,
  loader: async () => ({
    meta: await getMetaInfo(),
  }),
})

function PathlessLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
