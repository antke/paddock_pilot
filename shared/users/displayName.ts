/** Account identity only. Stable contact aliases must be labeled separately. */
export function accountDisplayName(
  user:
    | { preferredName?: string; firstName?: string; lastName?: string }
    | null
    | undefined,
  fallback = '',
) {
  const preferred = user?.preferredName?.trim()
  if (preferred) return preferred
  const first = user?.firstName?.trim()
  const name = [first === 'Member' ? '' : first, user?.lastName?.trim()]
    .filter(Boolean)
    .join(' ')
  return name || fallback
}
