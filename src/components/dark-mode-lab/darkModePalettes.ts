import type { PaletteTokens } from '#/components/page-lab/prototypes/paletteWorkshopPalettes'

type NightPalette = {
  id: string
  name: string
  description: string
  tokens: PaletteTokens
}

// Only consumed by the dark-mode lab and its dev-only app preview (`?darkStudy=`).
// The adopted application palette stays in styles.css.
function night(
  n: {
    canvas: string
    panel: string
    raised: string
    row: string
    selectionSurface: string
    border: string
    input: string
    sidebar: string
    muted: string
    selection: string
    ink: string
    warningSurface: string
  },
  g: {
    primary: string
    primaryInk: string
    action: string
    actionInk: string
    brand: string
    brandInk: string
    brandMuted: string
    brandBorder: string
  },
): PaletteTokens {
  return {
    '--selection': n.selection,
    '--selection-foreground': n.canvas,
    '--selection-surface': n.selectionSurface,
    '--background': n.canvas,
    '--foreground': n.ink,
    '--card': n.panel,
    '--card-foreground': n.ink,
    '--popover': n.raised,
    '--popover-foreground': n.ink,
    '--primary': g.primary,
    '--primary-foreground': g.primaryInk,
    '--action': g.action,
    '--action-foreground': g.actionInk,
    '--secondary': n.selectionSurface,
    '--secondary-foreground': n.ink,
    '--muted': n.row,
    '--muted-foreground': n.muted,
    '--accent': n.selectionSurface,
    '--accent-foreground': n.ink,
    '--destructive': '#f2a8b7',
    '--destructive-foreground': '#321c22',
    '--border': n.border,
    '--input': n.input,
    '--ring': g.primary,
    '--analysis-weight': g.primary,
    '--analysis-training': '#91bde9',
    '--analysis-nutrition': '#daba70',
    '--analysis-health': '#d1a7ce',
    '--analysis-condition': '#c8bd85',
    '--analysis-medication': '#b8afe8',
    '--analysis-care': '#8fc9c8',
    '--analysis-competition': '#d6af91',
    '--analysis-surface': n.panel,
    '--chart-1': g.primary,
    '--chart-2': '#a8bac5',
    '--chart-3': '#daba70',
    '--chart-4': '#d6af91',
    '--chart-5': '#efb5c0',
    '--status-info': '#b0c9e0',
    '--status-info-surface': '#293b4b',
    '--status-warning': '#f4d2a2',
    '--status-warning-surface': n.warningSurface,
    '--sidebar': n.sidebar,
    '--sidebar-foreground': n.ink,
    '--sidebar-primary': g.primary,
    '--sidebar-primary-foreground': g.primaryInk,
    '--sidebar-accent': n.selectionSurface,
    '--sidebar-accent-foreground': n.ink,
    '--sidebar-border': n.border,
    '--sidebar-ring': g.primary,
    '--surface': n.row,
    '--surface-muted': n.canvas,
    '--surface-elevated': n.raised,
    '--brand-surface': g.brand,
    '--brand-surface-foreground': g.brandInk,
    '--brand-surface-muted-foreground': g.brandMuted,
    '--brand-surface-border': g.brandBorder,
    '--border-subtle': 'color-mix(in oklab, var(--border) 76%, transparent)',
  }
}

const emerald = {
  primary: '#7fd1aa',
  primaryInk: '#0f2a1e',
  action: '#1d7352',
  actionInk: '#f2fbf6',
  brand: '#173c30',
  brandInk: '#f0f6f2',
  brandMuted: '#c3e4d3',
  brandBorder: '#4f9677',
}

// Fixed readable base: Ash surfaces (OKLCH hue ~50, chroma <= 0.007) with cream text.
// Each study adds one light "tack" accent to selection and focus only; green stays for actions.
const ash = {
  canvas: '#1b1817',
  panel: '#2f2c2b',
  raised: '#393635',
  row: '#353231',
  selectionSurface: '#494543',
  border: '#66625f',
  input: '#9c9795',
  sidebar: '#201e1c',
  muted: '#c9c3ba',
  selection: '#d9d5d1',
  ink: '#f2ece3',
  warningSurface: '#57442c',
}

const spruce = {
  primary: '#8ccfc5',
  primaryInk: '#122c29',
  action: '#2b6a68',
  actionInk: '#f2faf9',
  brand: '#1d3a3b',
  brandInk: '#eff6f5',
  brandMuted: '#c6dfdd',
  brandBorder: '#5a918d',
}

function withTack(
  fill: string,
  row: string,
  actions: typeof emerald = emerald,
): PaletteTokens {
  const tokens = night({ ...ash, selection: fill }, actions)
  return {
    ...tokens,
    // Only the nav row: --selection-surface also fills avatar placeholders and picker rows.
    '--sidebar-accent': row,
    '--ring': fill,
    '--sidebar-ring': fill,
  }
}

export const darkModePalettes: readonly NightPalette[] = [
  {
    id: 'ash',
    name: 'No accent',
    description:
      'The readable base on its own: Ash surfaces, cream text, neutral stone selection and emerald actions.',
    tokens: night(ash, emerald),
  },
  {
    id: 'brass',
    name: 'Brass',
    description:
      'Buckle brass for selected chips, the selected nav row and focus rings. The brightest of the three; shares a family with the amber warning badges.',
    tokens: withTack('#d9b97e', '#554434'),
  },
  {
    id: 'tan',
    name: 'Saddle tan',
    description:
      'Soft saddle-leather tan in the same places. The calmest of the three, closest to a neutral.',
    tokens: withTack('#d5af91', '#534439'),
  },
  {
    id: 'chestnut',
    name: 'Chestnut',
    description:
      'A chestnut coat: the warmest and most distinct accent, clearly apart from both green actions and amber warnings.',
    tokens: withTack('#d9906f', '#5c4033'),
  },
  {
    id: 'heather',
    name: 'Heather & emerald',
    description:
      'Moorland heather against bottle green: cool and quiet, and the only highlight that cannot be mistaken for a status colour.',
    tokens: withTack('#c6b5dd', '#4b4454'),
  },
  {
    id: 'copper',
    name: 'Copper & spruce',
    description:
      'Copper rivets and turquoise: complementary colours, the most western and the liveliest pairing.',
    tokens: withTack('#e5955d', '#5b4130', spruce),
  },
  {
    id: 'ivory',
    name: 'Ivory & emerald',
    description:
      'Bone ivory, almost white: highlight by brightness rather than colour. Crisp and formal, like a show-ring numnah.',
    tokens: withTack('#e8e0d3', '#4a4742'),
  },
  {
    id: 'chestnut-spruce',
    name: 'Chestnut & spruce',
    description:
      'The chestnut highlight with spruce actions: warm and cool in balance.',
    tokens: withTack('#d9906f', '#5c4033', spruce),
  },
  {
    id: 'tan-spruce',
    name: 'Tan & spruce',
    description:
      'Saddle tan with spruce actions: the softest of the combinations, leather and turquoise.',
    tokens: withTack('#d5af91', '#534439', spruce),
  },
]

// Lightness steps of roughly 0.12 OKLCH L from the cream ink. Tertiary is a proposal: no token yet.
export const darkTextScale = [
  { name: 'Primary', color: '#f2ece3', use: 'Titles, record names, body text' },
  { name: 'Secondary', color: '#c9c3ba', use: 'Descriptions and meta lines' },
  {
    name: 'Tertiary',
    color: '#a8a49c',
    use: 'Timestamps, counts and hints, on canvas and panels only',
  },
  {
    name: 'Disabled',
    color: '#77746f',
    use: 'Unavailable controls; exempt from contrast rules',
  },
] as const

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
      : 'ash',
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

export const darkStudyIds = darkModePalettes.map((palette) => palette.id)
