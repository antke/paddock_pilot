import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'

export const Route = createFileRoute('/api/documents/$documentId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const session = await auth()
        const token = await session.getToken({ template: 'convex' })
        if (!token) return new Response('Unauthorized', { status: 401 })
        const site = import.meta.env.VITE_CONVEX_URL?.replace(
          '.convex.cloud',
          '.convex.site',
        )
        if (!site) return new Response('Unavailable', { status: 503 })
        const response = await fetch(
          `${site}/horse-document?id=${encodeURIComponent(params.documentId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        return new Response(response.body, {
          status: response.status,
          headers: response.headers,
        })
      },
    },
  },
})
