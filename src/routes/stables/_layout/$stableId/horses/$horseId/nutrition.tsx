import { createFileRoute } from '@tanstack/react-router'
import {
  parseHorseNutritionSearch,
  redirectLegacyMedicationView,
} from '#/components/horses/horseNutritionSearch'

// HorseDetail renders this section. No component, so no lazy chunk whose first
// load would swap the whole page for the route loader.
export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/nutrition',
)({
  validateSearch: parseHorseNutritionSearch,
  beforeLoad: redirectLegacyMedicationView,
})
