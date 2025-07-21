import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/buckets/$id')({
  component: Outlet,
  loader: ({ params }) => ({
    crumb: params.id.substring(0, 16),
  }),
})
