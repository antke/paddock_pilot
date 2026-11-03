import type { FileRouteTypes, FileRoutesById } from '#/routeTree.gen'

/**
 * Where every page's top-left Back goes. This is the single source of truth:
 * page headers read it through `PageBack`, so pages never place Back by hand.
 *
 * - `false`: a global destination (Home, Events, Training, Horses, Stables) or a
 *   standalone flow with its own exit. No Back.
 * - `{ to }`: Back links to that parent page, reusing the current route params.
 * - `{ to, preferHistory: true }`: for detail pages reached from many lists;
 *   Back returns to the previous in-app page when there is one and otherwise
 *   links to `to`.
 * - `'none'`: not a page (layouts, redirects, auth, labs, files). Never renders.
 *
 * The record is exhaustive over the generated route tree, so adding a route
 * without deciding its Back is a type error.
 */
type RouteId = keyof FileRoutesById
type LabRouteId = Extract<
  RouteId,
  | `/page-lab${string}`
  | `/dashboard-lab${string}`
  | `/landing-lab${string}`
  | '/style-lab'
>
type AppRouteTo = Exclude<
  FileRouteTypes['to'],
  `/page-lab${string}` | `/dashboard-lab${string}` | `/landing-lab${string}`
>

export type PageBackTarget = { to: AppRouteTo; preferHistory?: boolean }
export type PageBackRule = false | 'none' | PageBackTarget

const toHorses = { to: '/horses' } as const
const toStable = { to: '/stables/$stableId' } as const
const toStableHorses = { to: '/stables/$stableId/horses' } as const

export const pageBackRules = {
  __root__: 'none',
  '/': false,
  '/events': 'none',
  '/horses': 'none',
  '/onboarding': false,
  '/pricing': false,
  '/profile': { to: '/', preferHistory: true },
  '/rss.xml': 'none',
  '/training': false,
  '/events/create': { to: '/events', preferHistory: true },
  '/horse-invitations/$token': false,
  '/horses/$horseId': 'none',
  '/horses/contacts': toHorses,
  '/horses/create': { to: '/horses', preferHistory: true },
  '/horses/deleted': toHorses,
  '/invitations/$token': false,
  '/sign-in/$': 'none',
  '/sign-up/$': 'none',
  '/stables/_layout': 'none',
  '/events/': false,
  '/horses/': false,
  '/api/documents/$documentId': 'none',
  '/events/$eventId/edit': { to: '/events/$eventId', preferHistory: true },
  '/horses/$horseId/activity': toHorses,
  '/horses/$horseId/analysis': toHorses,
  '/horses/$horseId/care': toHorses,
  '/horses/$horseId/care-summary': toHorses,
  '/horses/$horseId/documents': toHorses,
  '/horses/$horseId/edit': { to: '/horses/$horseId', preferHistory: true },
  '/horses/$horseId/manage': toHorses,
  '/horses/$horseId/nutrition': toHorses,
  '/horses/$horseId/profile': toHorses,
  '/horses/$horseId/timeline': toHorses,
  '/horses/$horseId/training': toHorses,
  '/stables/_layout/$stableId': 'none',
  '/stables/_layout/create': { to: '/stables', preferHistory: true },
  '/events/$eventId/': { to: '/events', preferHistory: true },
  '/horses/$horseId/': 'none',
  '/stables/_layout/': false,
  '/stables/_layout/$stableId/analysis': toStable,
  '/stables/_layout/$stableId/documents': 'none',
  '/stables/_layout/$stableId/edit': {
    to: '/stables/$stableId/stable',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/events': 'none',
  '/stables/_layout/$stableId/horses': 'none',
  '/stables/_layout/$stableId/members': toStable,
  '/stables/_layout/$stableId/reminders': toStable,
  '/stables/_layout/$stableId/settings': toStable,
  '/stables/_layout/$stableId/stable': toStable,
  '/stables/_layout/$stableId/training': 'none',
  '/stables/_layout/$stableId/welcome': 'none',
  '/stables/_layout/$stableId/': { to: '/stables' },
  '/stables/_layout/$stableId/events/$eventId': {
    to: '/stables/$stableId/events',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/events/calendar': 'none',
  '/stables/_layout/$stableId/events/create': {
    to: '/stables/$stableId/events',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/horses/$horseId': 'none',
  '/stables/_layout/$stableId/horses/create': {
    ...toStableHorses,
    preferHistory: true,
  },
  '/stables/_layout/$stableId/horses/deleted': toStableHorses,
  '/stables/_layout/$stableId/horses/history': toStableHorses,
  '/stables/_layout/$stableId/horses/unclaimed': toStableHorses,
  '/stables/_layout/$stableId/training/$eventId': {
    to: '/stables/$stableId/training',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/training/create': {
    to: '/stables/$stableId/training',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/events/': false,
  '/stables/_layout/$stableId/horses/': toStable,
  '/stables/_layout/$stableId/training/': false,
  '/stables/_layout/$stableId/events/$eventId/edit': {
    to: '/stables/$stableId/events/$eventId',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/horses/$horseId/activity': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/care': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/care-summary': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/documents': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/edit': {
    to: '/stables/$stableId/horses/$horseId',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/horses/$horseId/health': 'none',
  '/stables/_layout/$stableId/horses/$horseId/nutrition': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/profile': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/timeline': toStableHorses,
  '/stables/_layout/$stableId/horses/$horseId/training': toStableHorses,
  '/stables/_layout/$stableId/training/$eventId/edit': {
    to: '/stables/$stableId/training/$eventId',
    preferHistory: true,
  },
  '/stables/_layout/$stableId/horses/$horseId/': 'none',
} satisfies Record<Exclude<RouteId, LabRouteId>, PageBackRule>

/** The rule for the deepest matched route; labs and unknown ids render nothing. */
export function pageBackRuleFor(routeId: string): PageBackRule {
  return (pageBackRules as Record<string, PageBackRule>)[routeId] ?? 'none'
}
