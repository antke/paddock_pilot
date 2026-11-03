import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect before render. HorseDetail renders its outlet for any path that is
// not a section, so a rendered <Navigate> could fire mid-navigation (to the
// editor, for example) and pull the user back to the profile.
export const Route = createFileRoute('/horses/$horseId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/horses/$horseId/profile',
      params: { horseId: params.horseId },
      replace: true,
    })
  },
})
