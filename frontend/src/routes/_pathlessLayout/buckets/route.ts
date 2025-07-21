import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/buckets')({
  component: Outlet,
  loader: () => ({
    crumb: 'Buckets',
  }),
})
