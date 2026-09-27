export type HorseCareSearch = { careView?: 'health' }

export function parseHorseCareSearch(
  search: Record<string, unknown>,
): HorseCareSearch {
  return search.careView === 'health' ? { careView: 'health' } : {}
}
