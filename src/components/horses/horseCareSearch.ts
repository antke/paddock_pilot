export type HorseCareView = 'health' | 'medication'
export type HorseCareSearch = { careView?: HorseCareView }

export function parseHorseCareSearch(
  search: Record<string, unknown>,
): HorseCareSearch {
  return search.careView === 'health' || search.careView === 'medication'
    ? { careView: search.careView }
    : {}
}
