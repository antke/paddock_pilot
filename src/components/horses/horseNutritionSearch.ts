import { redirect } from '@tanstack/react-router'
import type { ParsedLocation } from '@tanstack/react-router'

export type HorseNutritionSearch = { nutritionView?: 'weight' }

export function parseHorseNutritionSearch(
  search: Record<string, unknown>,
): HorseNutritionSearch {
  return search.nutritionView === 'weight' ? { nutritionView: 'weight' } : {}
}

/**
 * Medication moved from Nutrition to Care. Old links and creation intents keep
 * their horse and stable scope and replace the old entry so Back is not trapped.
 */
export function redirectLegacyMedicationView({
  location,
  params,
}: {
  location: ParsedLocation
  params: { horseId: string; stableId?: string }
}) {
  const search = location.search as Record<string, unknown>
  if (search.nutritionView !== 'medication') return
  const { horseCreateAction, taskOrigin } = location.state
  const state = {
    ...(horseCreateAction ? { horseCreateAction } : {}),
    ...(taskOrigin ? { taskOrigin } : {}),
  }
  if (params.stableId) {
    throw redirect({
      to: '/stables/$stableId/horses/$horseId/care',
      params: { stableId: params.stableId, horseId: params.horseId },
      search: { careView: 'medication' },
      state,
      replace: true,
    })
  }
  throw redirect({
    to: '/horses/$horseId/care',
    params: { horseId: params.horseId },
    search: { careView: 'medication' },
    state,
    replace: true,
  })
}
