import { createFileRoute, redirect } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  return { userId }
})

export const Route = createFileRoute('/stables/_layout')({
  beforeLoad: async ({ location }) => {
    const { userId } = await fetchClerkAuth()
    if (!userId) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
    return { userId }
  },
  component: () => <Outlet />,
})
