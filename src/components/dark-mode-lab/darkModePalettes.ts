import type { PaletteTokens } from '#/components/page-lab/prototypes/paletteWorkshopPalettes'

type NightPalette = {
  id: string
  name: string
  description: string
  tokens: PaletteTokens
}

// Only consumed by the dark-mode lab. The application palette stays in styles.css.
function nightTokens(colors: {
  canvas: string
  panel: string
  raised: string
  row: string
  ink: string
  muted: string
  accent: string
  accentInk: string
  selection: string
  border: string
  input: string
  sidebar: string
}): PaletteTokens {
  return {
    '--background': colors.canvas,
    '--foreground': colors.ink,
    '--card': colors.panel,
    '--card-foreground': colors.ink,
    '--popover': colors.raised,
    '--popover-foreground': colors.ink,
    '--primary': colors.accent,
    '--primary-foreground': colors.accentInk,
    '--ring': colors.accent,
    '--selection': colors.ink,
    '--selection-foreground': colors.canvas,
    '--selection-surface': colors.selection,
    '--secondary': colors.selection,
    '--secondary-foreground': colors.ink,
    '--accent': colors.selection,
    '--accent-foreground': colors.ink,
    '--muted': colors.row,
    '--muted-foreground': colors.muted,
    '--surface': colors.row,
    '--surface-muted': colors.canvas,
    '--surface-elevated': colors.raised,
    '--border': colors.border,
    '--border-subtle': 'color-mix(in oklab, var(--border) 76%, transparent)',
    '--input': colors.input,
    '--sidebar': colors.sidebar,
    '--sidebar-foreground': colors.ink,
    '--sidebar-primary': colors.accent,
    '--sidebar-primary-foreground': colors.accentInk,
    '--sidebar-accent': colors.selection,
    '--sidebar-accent-foreground': colors.ink,
    '--sidebar-border': colors.border,
    '--sidebar-ring': colors.accent,
    '--destructive': '#f2a8b7',
    '--destructive-foreground': '#321c22',
    '--status-warning': '#edc28b',
    '--status-warning-surface': '#463729',
    '--status-info': '#b0c9e0',
    '--status-info-surface': '#293b4b',
    '--brand-surface': '#284639',
    '--brand-surface-foreground': '#f0f3ee',
    '--brand-surface-muted-foreground': '#c9dcd1',
    '--brand-surface-border': '#6c9680',
    '--analysis-surface': colors.panel,
    '--analysis-weight': colors.accent,
    '--analysis-training': '#91bde9',
    '--analysis-nutrition': '#daba70',
    '--analysis-health': '#d1a7ce',
    '--analysis-condition': '#c8bd85',
    '--analysis-medication': '#b8afe8',
    '--analysis-care': '#8fc9c8',
    '--analysis-competition': '#d6af91',
    '--chart-1': colors.accent,
    '--chart-2': '#a8bac5',
    '--chart-3': '#daba70',
    '--chart-4': '#d6af91',
    '--chart-5': '#efb5c0',
  }
}

export const darkModePalettes: readonly NightPalette[] = [
  {
    id: 'charcoal',
    name: 'Charcoal & pine',
    description:
      'The closest companion to bright mode. Soft charcoal, paper-coloured text and a clearer pine green, with neutral stone selections.',
    tokens: nightTokens({
      canvas: '#1c1e1d',
      panel: '#272a28',
      raised: '#303431',
      row: '#2c302d',
      ink: '#eeece8',
      muted: '#b8bcb8',
      accent: '#91c8a9',
      accentInk: '#172b20',
      selection: '#3e4440',
      border: '#515a54',
      input: '#8b978e',
      sidebar: '#202321',
    }),
  },
  {
    id: 'warm-ink',
    name: 'Warm ink',
    description:
      'A warmer evening journal. Brown-black ink, soft parchment text and muted eucalyptus bring the warmth of the paper theme into the night.',
    tokens: nightTokens({
      canvas: '#241f20',
      panel: '#312a2c',
      raised: '#3b3335',
      row: '#362e30',
      ink: '#f1e8df',
      muted: '#c4b7b2',
      accent: '#afc7b5',
      accentInk: '#202c24',
      selection: '#4b4042',
      border: '#655658',
      input: '#a38e91',
      sidebar: '#292325',
    }),
  },
  {
    id: 'slate',
    name: 'Midnight slate',
    description:
      'A cooler, crisper workspace. Deep slate, pale stone text and a fresh sea-green accent; the largest departure from the current olive tones.',
    tokens: nightTokens({
      canvas: '#19222b',
      panel: '#24313d',
      raised: '#2e3d4a',
      row: '#293744',
      ink: '#e8edf0',
      muted: '#b3c0ca',
      accent: '#8acfc1',
      accentInk: '#162d29',
      selection: '#384b59',
      border: '#526b7c',
      input: '#91a7b7',
      sidebar: '#1d2833',
    }),
  },
]

export type DarkModeSearch = {
  palette: string
  reference: 'candidate' | 'current' | 'light'
  surface: 'dashboard' | 'calendar' | 'form' | 'controls'
}

export function parseDarkModeSearch(
  search: Record<string, unknown>,
): DarkModeSearch {
  return {
    palette: darkModePalettes.some((p) => p.id === search.palette)
      ? String(search.palette)
      : 'charcoal',
    reference:
      search.reference === 'light' || search.reference === 'current'
        ? search.reference
        : 'candidate',
    surface:
      search.surface === 'calendar' ||
      search.surface === 'form' ||
      search.surface === 'controls'
        ? search.surface
        : 'dashboard',
  }
}

export const darkModePreviewCss = darkModePalettes
  .map(
    (palette) =>
      `:root.dark[data-dark-study="${palette.id}"]{${Object.entries(
        palette.tokens,
      )
        .map(([token, value]) => `${token}:${value};`)
        .join('')}}`,
  )
  .join('\n')
