import { createContext, useContext, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'

type CaptureTheme = 'light' | 'dark'
const ThemeBoundaryContext = createContext(false)

// A capture is its own document. Changing only a descendant class cannot
// override inherited root variables or an ancestor .dark selector.
export function LandingLabThemeBoundary({
  children,
  theme,
}: {
  children: ReactNode
  theme: CaptureTheme
}) {
  const hasDocumentOwner = useContext(ThemeBoundaryContext)
  useLayoutEffect(() => {
    if (hasDocumentOwner) return
    const root = document.documentElement
    const previous = {
      light: root.classList.contains('light'),
      dark: root.classList.contains('dark'),
      mode: root.getAttribute('data-theme'),
      colorScheme: root.style.colorScheme,
      stored: readStoredTheme(),
    }
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme

    return () => {
      root.classList.toggle('light', previous.light)
      root.classList.toggle('dark', previous.dark)
      if (previous.mode === null) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', previous.mode)
      root.style.colorScheme = previous.colorScheme

      // An automatic theme may have changed while its app toggle was absent.
      // Another tab may also have changed the stored preference. Restore that
      // current preference without ever persisting the capture's choice.
      const stored = readStoredTheme()
      if (
        stored === 'auto' ||
        (stored !== undefined && stored !== previous.stored)
      ) {
        const mode = stored === 'dark' || stored === 'auto' ? stored : 'light'
        const resolved =
          mode === 'auto'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : mode
        root.classList.remove('light', 'dark')
        root.classList.add(resolved)
        if (mode === 'auto') root.removeAttribute('data-theme')
        else root.setAttribute('data-theme', mode)
        root.style.colorScheme = resolved
      }
    }
  }, [hasDocumentOwner, theme])

  return (
    <ThemeBoundaryContext.Provider value={true}>
      {children}
    </ThemeBoundaryContext.Provider>
  )
}

function readStoredTheme(): string | null | undefined {
  try {
    return window.localStorage.getItem('theme')
  } catch {
    // Storage access can be denied in embedded/private contexts. The existing
    // document state is still a valid restoration target.
    return undefined
  }
}
