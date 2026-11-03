import { createFileRoute } from '@tanstack/react-router'
import {
  parseHorseNutritionSearch,
  redirectLegacyMedicationView,
} from '#/components/horses/horseNutritionSearch'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/nutrition',
)({
  validateSearch: parseHorseNutritionSearch,
  beforeLoad: redirectLegacyMedicationView,
  component: () => null,
})
