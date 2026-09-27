import type { ComponentProps } from 'react'
import type { ClerkProvider } from '@clerk/tanstack-react-start'

// One bridge for provider-owned controls. Values follow the app's live theme;
// routes must not recreate a separate auth palette or override widget internals.
export const clerkAppearance = {
  variables: {
    fontFamily: 'var(--font-sans)',
    fontFamilyButtons: 'var(--font-sans)',
    fontSize: 'var(--text-base)',
    colorPrimary: 'var(--primary)',
    colorPrimaryForeground: 'var(--primary-foreground)',
    colorForeground: 'var(--foreground)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorBackground: 'var(--card)',
    colorInput: 'var(--surface-elevated)',
    colorInputForeground: 'var(--foreground)',
    colorBorder: 'var(--border)',
    colorRing: 'var(--ring)',
    colorDanger: 'var(--destructive)',
    colorNeutral: 'var(--foreground)',
  },
  elements: {
    rootBox: { width: '100%', maxWidth: '100%' },
    cardBox: { width: '100%', maxWidth: '100%' },
    headerTitle: { fontFamily: 'var(--font-display)' },
  },
} satisfies NonNullable<ComponentProps<typeof ClerkProvider>['appearance']>
