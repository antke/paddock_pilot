import { createFileRoute } from '@tanstack/react-router'
import { parseHorseNutritionSearch } from '#/components/horses/horseNutritionSearch'

export const Route = createFileRoute('/horses/$horseId/nutrition')({
  validateSearch: parseHorseNutritionSearch,
  component: () => null,
})
