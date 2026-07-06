import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/page-lab/')({
  component: () => (
    <Navigate to="/page-lab/$page" params={{ page: 'stable-dashboard' }} />
  ),
})
