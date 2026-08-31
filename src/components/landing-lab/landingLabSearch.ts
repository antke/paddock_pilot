import type { LandingLabTheme, LandingLabViewport } from './LandingLabChrome'
import { isLandingLabVariantId } from './landingLabVariants'
import type { LandingLabVariantId } from './landingLabVariants'
import {
  getCanonicalPaddockMapVersion,
  isPaddockMapVersionId,
} from './variants/paddock-map/paddockMapVersions'
import type { PaddockMapVersionId } from './variants/paddock-map/paddockMapVersions'

export type LandingLabSearch = {
  mode: 'review' | 'capture'
  theme: LandingLabTheme
  viewport: LandingLabViewport
  mapVersion?: PaddockMapVersionId
}

type LandingLabVersionState = {
  mapVersion?: PaddockMapVersionId
}

export function parseLandingLabSearch(
  search: Record<string, unknown>,
): LandingLabSearch {
  const viewport = String(search.viewport ?? 'fit')
  const mapVersion = isPaddockMapVersionId(search.mapVersion)
    ? search.mapVersion
    : undefined

  return {
    mode: search.mode === 'capture' ? 'capture' : 'review',
    theme: search.theme === 'dark' ? 'dark' : 'light',
    viewport:
      viewport === '390' || viewport === '768' || viewport === '1440'
        ? viewport
        : 'fit',
    ...(mapVersion ? { mapVersion } : {}),
  }
}

export function getLandingLabReviewSearch({
  mapVersion,
  theme,
  variantId,
  viewport,
}: {
  theme: LandingLabTheme
  variantId: LandingLabVariantId
  viewport: LandingLabViewport
} & LandingLabVersionState): LandingLabSearch {
  return {
    mode: 'review',
    theme,
    viewport,
    mapVersion:
      variantId === 'paddock-map'
        ? getCanonicalPaddockMapVersion(mapVersion)
        : undefined,
  }
}

export function getLandingLabCaptureSource({
  mapVersion,
  theme,
  variantId,
}: {
  theme: LandingLabTheme
  variantId: LandingLabVariantId
} & LandingLabVersionState): string {
  const search = new URLSearchParams({ mode: 'capture', theme })
  const canonicalVersion =
    variantId === 'paddock-map'
      ? getCanonicalPaddockMapVersion(mapVersion)
      : undefined

  if (canonicalVersion) search.set('mapVersion', canonicalVersion)

  return `/landing-lab/${variantId}?${search.toString()}`
}

export function getLandingLabCaptureUrl({
  currentHref,
  mapVersion,
  theme,
  variantId,
}: {
  currentHref: string
  theme: LandingLabTheme
  variantId: LandingLabVariantId
} & LandingLabVersionState): string {
  const url = new URL(currentHref)
  const canonicalVersion =
    variantId === 'paddock-map'
      ? getCanonicalPaddockMapVersion(mapVersion)
      : undefined

  url.searchParams.set('mode', 'capture')
  url.searchParams.set('theme', theme)
  url.searchParams.delete('viewport')

  if (canonicalVersion) {
    url.searchParams.set('mapVersion', canonicalVersion)
  } else {
    url.searchParams.delete('mapVersion')
  }

  return url.toString()
}

export function parseLandingLabSelection(search: Record<string, unknown>): {
  selected?: LandingLabVariantId
} {
  return {
    selected:
      typeof search.selected === 'string' &&
      isLandingLabVariantId(search.selected)
        ? search.selected
        : undefined,
  }
}
