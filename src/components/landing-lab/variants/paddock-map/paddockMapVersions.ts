export const paddockMapVersions = [
  {
    id: 'layered-fields',
    label: 'Layered Fields',
  },
  {
    id: 'moving-gates',
    label: 'Moving Gates',
  },
  {
    id: 'night-survey',
    label: 'Night Survey',
  },
] as const

export type PaddockMapVersionId = (typeof paddockMapVersions)[number]['id']

export const defaultPaddockMapVersionId: PaddockMapVersionId = 'layered-fields'

export function isPaddockMapVersionId(
  value: unknown,
): value is PaddockMapVersionId {
  return paddockMapVersions.some((version) => version.id === value)
}

export function resolvePaddockMapVersionId(
  value: unknown,
): PaddockMapVersionId {
  return isPaddockMapVersionId(value) ? value : defaultPaddockMapVersionId
}

export function getCanonicalPaddockMapVersion(
  value: unknown,
): PaddockMapVersionId | undefined {
  const versionId = resolvePaddockMapVersionId(value)
  return versionId === defaultPaddockMapVersionId ? undefined : versionId
}
