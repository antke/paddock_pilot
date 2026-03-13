import { Show } from '@clerk/tanstack-react-start';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const identity = useQuery(api.users.getCurrentIdentity);
  console.log(identity);

  return (
    <main className="page-wrap px-4 py-16">
      <Show when="signed-out">
        <h3>Hello sign up</h3>
      </Show>

      <Show when="signed-in">
        <h3>Welcome back {identity?.name}</h3>
        <h2>
          to musi byc zrobione lepiej i ladowac sie w pre-flight, ustawiac
          suspense
        </h2>
      </Show>
    </main>
  );
}
