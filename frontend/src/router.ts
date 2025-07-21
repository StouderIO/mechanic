import { createRouter } from '@tanstack/react-router'
import { routeTree } from './generated/router/routeTree.gen'

const router = createRouter({
  routeTree,
  context: { crumb: '' },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
