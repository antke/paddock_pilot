export type HorseNutritionSearch = { nutritionView?: 'weight' | 'medication' }

export function parseHorseNutritionSearch(
  search: Record<string, unknown>,
): HorseNutritionSearch {
  return search.nutritionView === 'weight' ||
    search.nutritionView === 'medication'
    ? { nutritionView: search.nutritionView }
    : {}
}
