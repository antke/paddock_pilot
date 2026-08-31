import { describe, expect, it } from 'vitest'
import {
  getLandingLabCaptureSource,
  getLandingLabCaptureUrl,
  getLandingLabReviewSearch,
  parseLandingLabSearch,
  parseLandingLabSelection,
} from './landingLabSearch'

const registeredSelections = [
  'gathered-yard',
  'stable-aisle',
  'paddock-map',
  'care-cycle',
  'owner-member-gatefold',
] as const

describe('landing lab search parsing', () => {
  it('accepts supported review controls and Paddock Map versions', () => {
    expect(
      parseLandingLabSearch({
        mode: 'capture',
        theme: 'dark',
        viewport: '390',
        mapVersion: 'moving-gates',
      }),
    ).toEqual({
      mode: 'capture',
      theme: 'dark',
      viewport: '390',
      mapVersion: 'moving-gates',
    })

    expect(
      parseLandingLabSearch({
        viewport: 768,
        mapVersion: 'night-survey',
      }),
    ).toEqual({
      mode: 'review',
      theme: 'light',
      viewport: '768',
      mapVersion: 'night-survey',
    })

    expect(
      parseLandingLabSearch({ mapVersion: 'layered-fields' }).mapVersion,
    ).toBe('layered-fields')
  })

  it('falls back to safe review defaults and rejects unknown map versions', () => {
    const parsed = parseLandingLabSearch({
      mode: 'publish',
      theme: 'sepia',
      viewport: '999',
      mapVersion: 'unknown-map',
    })

    expect(parsed).toEqual({
      mode: 'review',
      theme: 'light',
      viewport: 'fit',
    })
    expect(parsed.mapVersion).toBeUndefined()
  })

  it('keeps every registered overdrive direction', () => {
    for (const selected of registeredSelections) {
      expect(parseLandingLabSelection({ selected })).toEqual({ selected })
    }
  })

  it('rejects removed and unknown concept selections', () => {
    for (const selected of [
      'shared-field',
      'four-lines-one-workspace',
      'stable-horse',
      'unknown',
    ]) {
      expect(parseLandingLabSelection({ selected })).toEqual({
        selected: undefined,
      })
    }
  })
})

describe('landing lab review and capture URLs', () => {
  it('preserves a selected study through review controls', () => {
    expect(
      getLandingLabReviewSearch({
        variantId: 'paddock-map',
        theme: 'dark',
        viewport: '768',
        mapVersion: 'night-survey',
      }),
    ).toEqual({
      mode: 'review',
      theme: 'dark',
      viewport: '768',
      mapVersion: 'night-survey',
    })
  })

  it('canonicalizes Layered Fields and clears versions on other concepts', () => {
    expect(
      getLandingLabReviewSearch({
        variantId: 'paddock-map',
        theme: 'light',
        viewport: 'fit',
        mapVersion: 'layered-fields',
      }).mapVersion,
    ).toBeUndefined()

    expect(
      getLandingLabReviewSearch({
        variantId: 'stable-aisle',
        theme: 'light',
        viewport: '390',
        mapVersion: 'moving-gates',
      }).mapVersion,
    ).toBeUndefined()
  })

  it('builds canonical capture sources without viewport state', () => {
    expect(
      getLandingLabCaptureSource({
        variantId: 'paddock-map',
        theme: 'dark',
        mapVersion: 'moving-gates',
      }),
    ).toBe(
      '/landing-lab/paddock-map?mode=capture&theme=dark&mapVersion=moving-gates',
    )

    expect(
      getLandingLabCaptureSource({
        variantId: 'paddock-map',
        theme: 'light',
        mapVersion: 'layered-fields',
      }),
    ).toBe('/landing-lab/paddock-map?mode=capture&theme=light')

    expect(
      getLandingLabCaptureSource({
        variantId: 'care-cycle',
        theme: 'light',
        mapVersion: 'night-survey',
      }),
    ).toBe('/landing-lab/care-cycle?mode=capture&theme=light')
  })

  it('creates copied capture URLs that retain only relevant study state', () => {
    const movingGatesUrl = getLandingLabCaptureUrl({
      currentHref:
        'https://example.test/landing-lab/paddock-map?mode=review&theme=light&viewport=1440&mapVersion=moving-gates',
      variantId: 'paddock-map',
      theme: 'dark',
      mapVersion: 'moving-gates',
    })
    const movingGatesSearch = new URL(movingGatesUrl).searchParams

    expect(movingGatesSearch.get('mode')).toBe('capture')
    expect(movingGatesSearch.get('theme')).toBe('dark')
    expect(movingGatesSearch.get('mapVersion')).toBe('moving-gates')
    expect(movingGatesSearch.has('viewport')).toBe(false)

    const otherConceptUrl = getLandingLabCaptureUrl({
      currentHref:
        'https://example.test/landing-lab/stable-aisle?mode=review&mapVersion=night-survey&viewport=390',
      variantId: 'stable-aisle',
      theme: 'light',
      mapVersion: 'night-survey',
    })

    expect(new URL(otherConceptUrl).searchParams.has('mapVersion')).toBe(false)
  })
})
