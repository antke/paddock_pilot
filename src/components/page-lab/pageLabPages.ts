export const pageLabPages = [
  { id: 'route-recovery', label: 'Route recovery' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'profile', label: 'Account profile' },
  { id: 'pricing', label: 'Pricing states' },
  { id: 'invitations', label: 'Invitation access' },
  { id: 'header', label: 'Application header' },
  { id: 'horse-invitations', label: 'Horse invitations' },
  { id: 'horse-records', label: 'Horse records' },
  { id: 'horse-activity', label: 'Horse activity' },
  { id: 'members-settings', label: 'Members settings' },
  { id: 'members-directory', label: 'Members directory' },
  { id: 'deleted-horses', label: 'Deleted horses' },
  { id: 'stable-welcome', label: 'Stable welcome' },
  { id: 'stable-form', label: 'Stable form' },
  { id: 'stable-layout', label: 'Stable route layout' },
  { id: 'providers', label: 'Providers' },
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
    id: 'horse-form',
    label: 'Horse form',
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
    id: 'event-service-notes',
    label: 'Service notes',
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
