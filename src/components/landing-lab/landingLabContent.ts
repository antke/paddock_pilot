export const landingLabContent = {
  productName: 'Paddock Pilot',
  primaryAction: 'Create your account',
  primaryActionTo: '/sign-up/$',
  signInAction: 'Sign in',
  signInActionTo: '/sign-in/$',
  promise: 'One shared workspace for horse records and day-to-day stable care.',
  audience:
    'Built for small stable owners and the members who help care for the horses around them.',
  capabilities: [
    {
      id: 'stable-view',
      title: 'See what needs attention.',
      description:
        'Bring appointments, events, reminders, and the horse roster into one clear stable view.',
    },
    {
      id: 'horse-context',
      title: 'Keep each horse’s context together.',
      description:
        'Keep profile details, care contacts, documents, provider information, and care history with the horse they belong to.',
    },
    {
      id: 'stable-work',
      title: 'Plan the work. Record what was done.',
      description:
        'Create one-off or recurring stable work, connect it to the relevant horses, and keep the completed record available.',
    },
    {
      id: 'shared-access',
      title: 'Give the right people a shared place to work.',
      description:
        'Invite stable members into the workspace while keeping access and management responsibilities appropriately scoped.',
    },
  ],
} as const

export const forbiddenLandingClaims = [
  'free trial',
  'no card required',
  'cancel anytime',
  'trusted by',
  'save hours',
  'guaranteed',
  'cedar ridge',
  'juniper',
  'example workspace',
  'illustrative care journey',
] as const
