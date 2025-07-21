import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  crumb: string
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
})
