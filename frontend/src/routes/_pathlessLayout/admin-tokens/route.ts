import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/admin-tokens')({
  component: Outlet,
  loader: () => ({
    crumb: 'Admin Tokens',
  }),
})
