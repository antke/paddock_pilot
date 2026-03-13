import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stables/create')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/stables/create"!</div>;
}
