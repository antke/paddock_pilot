import { createFileRoute } from '@tanstack/react-router'

// HorseDetail renders this section. No component, so no lazy chunk whose first
// load would swap the whole page for the route loader.
export const Route = createFileRoute('/horses/$horseId/training')({})
