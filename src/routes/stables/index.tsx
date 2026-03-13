import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stables/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/stables/"!</div>;
}
