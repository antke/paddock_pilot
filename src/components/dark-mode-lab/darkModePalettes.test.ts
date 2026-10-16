import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { paletteContrast } from '#/components/page-lab/prototypes/paletteWorkshopPalettes'
import {
  darkModePalettes,
  darkModePreviewCss,
  parseDarkModeSearch,
} from './darkModePalettes'

describe('dark mode study palettes', () => {
  for (const palette of darkModePalettes) {
    it(`${palette.name} keeps text, status and controls readable across its surfaces`, () => {
      const t = palette.tokens
      const surfaces = [
        '--background',
        '--card',
        '--popover',
        '--surface',
        '--selection-surface',
      ] as const
      for (const surface of surfaces) {
        for (const foreground of [
          '--foreground',
          '--muted-foreground',
          '--primary',
          '--destructive',
        ]) {
          expect(
            paletteContrast(t[foreground as `--${string}`], t[surface]),
            `${foreground} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5)
        }
        expect(
          paletteContrast(t['--input'], t[surface]),
          `control border on ${surface}`,
        ).toBeGreaterThanOrEqual(3)
      }
      for (const [foreground, background] of [
        ['--primary-foreground', '--primary'],
        ['--selection-foreground', '--selection'],
        ['--status-warning', '--status-warning-surface'],
        ['--status-info', '--status-info-surface'],
        ['--brand-surface-muted-foreground', '--brand-surface'],
      ] as const)
        expect(
          paletteContrast(t[foreground], t[background]),
        ).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('provides every incumbent dark colour role without changing layout tokens', () => {
    const source = readFileSync(
      new URL('../../styles.css', import.meta.url),
      'utf8',
    )
    const currentDark = source.match(/\n\.dark\s*\{([^}]+)\}/)![1]
    const roles = [...currentDark.matchAll(/(--[\w-]+)\s*:/g)]
      .map((match) => match[1])
      .sort()
    for (const palette of darkModePalettes)
      expect(Object.keys(palette.tokens).sort()).toEqual(roles)
    expect(darkModePreviewCss).not.toContain(':root.light')
  })

  it('normalizes unknown or injected URL values to a safe, viewable default', () => {
    expect(
      parseDarkModeSearch({
        palette: '"]{color:red}',
        reference: 'auto',
        surface: ['form'],
      }),
    ).toEqual({
      palette: 'charcoal',
      reference: 'candidate',
      surface: 'dashboard',
    })
    expect(
      parseDarkModeSearch({
        palette: 'warm-ink',
        reference: 'light',
        surface: 'controls',
      }),
    ).toEqual({ palette: 'warm-ink', reference: 'light', surface: 'controls' })
  })
})
