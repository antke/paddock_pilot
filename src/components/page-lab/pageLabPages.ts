export const pageLabPages = [
  {
    id: 'stable-dashboard',
    label: 'Stable dashboard',
  },
  {
    id: 'stables-list',
    label: 'Stables list',
  },
  {
    id: 'horse-list',
    label: 'Horse list',
  },
  {
    id: 'horse-detail',
    label: 'Horse detail',
  },
  {
    id: 'event-list',
    label: 'Event list',
  },
  {
    id: 'event-detail',
    label: 'Event detail',
  },
  {
    id: 'reminders',
    label: 'Reminders',
  },
  {
    id: 'documents',
    label: 'Documents',
  },
  {
    id: 'analysis',
    label: 'Analysis',
  },
  {
    id: 'settings',
    label: 'Settings',
  },
  {
    id: 'forms',
    label: 'Forms',
  },
  {
    id: 'calendar',
    label: 'Calendar',
  },
  {
    id: 'timeline',
    label: 'Timeline',
  },
  {
    id: 'care-summary',
    label: 'Care summary',
  },
] as const

export type PageLabPageId = (typeof pageLabPages)[number]['id']

export function getPageLabPage(pageId: string) {
  return pageLabPages.find((page) => page.id === pageId)
}
