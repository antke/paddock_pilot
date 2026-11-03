import { createFileRoute, redirect } from '@tanstack/react-router'

/** Former standalone page: it now opens inside the stable view as a tab. */
export const Route = createFileRoute('/stables/_layout/$stableId/documents')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/stables/$stableId/stable',
      params,
      search: { tab: 'documents' },
      replace: true,
    })
  },
})
