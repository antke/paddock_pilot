export const listControls = {
  search: 'Search',
  filters: 'Filters',
  toggle: 'Toggle filters',
  activeToggle: 'Toggle filters, {{count}} active',
  clear: 'Clear all',
  remove: 'Remove {{title}} filter',
  sectionViews: 'Section views',
  showSuggestions: 'Show suggestions',
  dashboardEmpty: 'Create a stable to start using the dashboard.',
  dashboardFailed: 'The stable noticeboard couldn’t load',
  dashboardFailedHelp:
    'Check your connection, then try again. Your stable records have not been changed.',
  membershipMissing: 'Membership not found',
  membershipMissingHelp:
    'Your account is not connected to this stable as an active member.',
  results_one: '{{count}} result',
  results_few: '{{count}} results',
  results_many: '{{count}} results',
  results_other: '{{count}} results',
} as const
