import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/buckets/$id/browse')({
  component: Outlet,
  loader: () => ({
    crumb: 'Browse',
  }),
})
