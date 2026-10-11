import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { RoutePending } from './components/layout/RoutePending'
import { RouteError } from './components/layout/RouteError'
import { installPageTransitions } from './components/layout/pageTransitions'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePending,
    defaultErrorComponent: RouteError,
    defaultPendingMs: 250,
    defaultPendingMinMs: 0,
  })

  installPageTransitions(router)
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
