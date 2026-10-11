/** Empty optional fields registered by a form are not user edits. */
export function hasDraftChanges(values: unknown, initialValues: unknown) {
  return (
    JSON.stringify(normalize(values)) !==
    JSON.stringify(normalize(initialValues))
  )
}

function normalize(value: unknown): unknown {
  if (value === '' || value === undefined) return undefined
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, normalize(item)] as const)
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value
}
