import type { AnyRouter, ParsedLocation } from '@tanstack/react-router'
import { horseDetailTabs } from '#/components/horses/horseDetailTabs'

type Location = Pick<ParsedLocation, 'pathname' | 'state'>
type LocationChange = { fromLocation?: Location; toLocation: Location }
type PageTransition = {
  scope: 'page' | 'horse-section'
  direction:
    | 'fade'
    | 'forward'
    | 'back'
    | 'tab-next'
    | 'tab-previous'
    | 'create-open'
    | 'create-close'
}

const horseSections = new Set([
  '',
  ...horseDetailTabs,
  'health',
  'manage',
  'timeline',
  'care-summary',
  'analysis',
])
const horseListPaths = new Set([
  'create',
  'deleted',
  'contacts',
  'history',
  'unclaimed',
])

function describePath(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (
    path !== '/' &&
    !/^\/(horses|events|training|stables|profile)(\/|$)/.test(path)
  ) {
    return undefined
  }
  const stable = path.match(/^\/stables\/([^/]+)(.*)$/)
  if (stable?.[2] === '/welcome') return undefined
  const workspace =
    stable && stable[1] !== 'create' ? `/stables/${stable[1]}` : ''
  const local = workspace ? stable![2] || '/' : path
  const horse = local.match(/^\/horses\/([^/]+)(?:\/([^/]+))?$/)
  const horseId = horse && !horseListPaths.has(horse[1]) ? horse[1] : undefined
  const section = horse?.[2] ?? ''
  const parts = local.split('/').filter(Boolean)
  const depth = horseId
    ? section === 'edit'
      ? 2
      : 1
    : parts.at(-1) === 'edit'
      ? 2
      : parts.length > 1
        ? 1
        : 0
  const tab = ['/', '/events', '/training', '/horses'].indexOf(local)
  const creation = /^\/(events|training|horses|stables)\/create$/.test(local)
  return { path, workspace, horseId, section, depth, tab, creation }
}

function horseTabIndex(section: string) {
  const canonical =
    section === '' ? 'profile' : section === 'health' ? 'care' : section
  return horseDetailTabs.findIndex((tab) => tab === canonical)
}

/** Navigation meaning, independent of viewport, browser support and rendering. */
export function getPageTransition({
  fromLocation,
  toLocation,
}: LocationChange): PageTransition | undefined {
  if (!fromLocation) return undefined
  const from = describePath(fromLocation.pathname)
  const to = describePath(toLocation.pathname)
  // Includes filters, hash links, background invalidation and initial hydration.
  if (!from || !to || from.path === to.path) return undefined
  if (to.creation && !from.creation)
    return { scope: 'page', direction: 'create-open' }
  if (from.creation && !to.creation)
    return { scope: 'page', direction: 'create-close' }
  if (
    from.horseId &&
    from.horseId === to.horseId &&
    // Stable horse links can lead to the same horse's canonical personal URL.
    (from.workspace === to.workspace || !from.workspace || !to.workspace) &&
    horseSections.has(from.section) &&
    horseSections.has(to.section)
  ) {
    const fromTab = horseTabIndex(from.section)
    const toTab = horseTabIndex(to.section)
    if (fromTab >= 0 && toTab >= 0) {
      if (fromTab === toTab) return undefined
      return {
        scope: 'horse-section',
        direction: toTab > fromTab ? 'tab-next' : 'tab-previous',
      }
    }
    return { scope: 'horse-section', direction: 'fade' }
  }
  if (from.workspace !== to.workspace)
    return { scope: 'page', direction: 'fade' }
  if (from.tab >= 0 && to.tab >= 0)
    return {
      scope: 'page',
      direction: to.tab > from.tab ? 'tab-next' : 'tab-previous',
    }
  if (from.depth === 0 && to.depth === 0)
    return { scope: 'page', direction: 'fade' }
  const fromIndex = fromLocation.state.__TSR_index
  const toIndex = toLocation.state.__TSR_index
  const goingBack =
    typeof fromIndex === 'number' &&
    typeof toIndex === 'number' &&
    toIndex < fromIndex
  return {
    scope: 'page',
    direction:
      goingBack || to.depth < from.depth
        ? 'back'
        : to.depth > from.depth
          ? 'forward'
          : 'fade',
  }
}

/** Uses the router's native commit boundary; never delays or owns navigation. */
export function installPageTransitions(router: AnyRouter) {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement
  const canAnimate = () =>
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
    Boolean(document.querySelector('[data-slot="app-main-content"]')) &&
    !document.querySelector(
      '[data-slot="route-pending"], [role="dialog"], [role="alertdialog"]',
    )

  const prepare = (change: LocationChange) => {
    const transition = canAnimate() ? getPageTransition(change) : undefined
    if (transition) {
      root.dataset.transitionScope = transition.scope
      root.dataset.pageTransition = transition.direction
    } else {
      delete root.dataset.transitionScope
      delete root.dataset.pageTransition
    }
    return Boolean(transition)
  }

  const unsubscribe = router.subscribe('onBeforeNavigate', (change) => {
    // Gate here as well: older implementations support snapshots but not types,
    // so TanStack does not call the types callback in those browsers.
    router.update({
      defaultViewTransition: prepare(change)
        ? {
            types: (committedChange) =>
              prepare(committedChange) ? ['app-navigation'] : false,
          }
        : false,
    })
  })
  return () => {
    unsubscribe()
    router.update({ defaultViewTransition: false })
    delete root.dataset.transitionScope
    delete root.dataset.pageTransition
  }
}
