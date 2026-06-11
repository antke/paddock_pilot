import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard-lab/')({
  component: () => <Navigate to="/dashboard-lab/$version" params={{ version: '1' }} />,
})
