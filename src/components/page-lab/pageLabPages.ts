export const pageLabPages = [
  {
    id: 'stable-dashboard',
    label: 'Stable dashboard',
    description: 'Command-center layout for the active stable overview.',
  },
  {
    id: 'stables-list',
    label: 'Stables list',
    description: 'Stable selection and portfolio browsing.',
    status: 'ready',
  },
  {
    id: 'horse-list',
    label: 'Horse list',
    description: 'Roster browsing and horse profile entry points.',
    status: 'ready',
  },
  {
    id: 'horse-detail',
    label: 'Horse detail',
    description: 'Horse profile, care, and event detail composition.',
    status: 'ready',
  },
  {
    id: 'event-list',
    label: 'Event list',
    description: 'Schedule browsing and event triage.',
    status: 'ready',
  },
  {
    id: 'event-detail',
    label: 'Event detail',
    description: 'Event briefing, participants, and service notes.',
    status: 'ready',
  },
  {
    id: 'reminders',
    label: 'Reminders',
    description: '',
    status: 'ready',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Stable and horse document management.',
    status: 'ready',
  },
  {
    id: 'analysis',
    label: 'Analysis',
    description: 'Operational insights and risk summaries.',
    status: 'ready',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Stable profile, members, and providers.',
  },
  {
    id: 'forms',
    label: 'Forms',
    description: 'Create and edit flows for stable records.',
  },
  {
    id: 'surface-system',
    label: 'Surface system',
    description: 'Role recognition for filters, forms, lists, and states.',
  },
] as const

export type PageLabPageId = (typeof pageLabPages)[number]['id']

export function getPageLabPage(pageId: string) {
  return pageLabPages.find((page) => page.id === pageId)
}
