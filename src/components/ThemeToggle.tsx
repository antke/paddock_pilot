import { useT } from '#/i18n/LocaleProvider'
import { useEffect, useRef, useState } from 'react'
import { Button } from '#/components/ui/button'
import { DesktopIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'

type ThemeMode = 'light' | 'dark' | 'auto'
const THEME_CHANGE_EVENT = 'paddock-theme-change'

// A rejected write should not discard the user's choice on a route remount.
// Keep this fallback per document; a later storage change takes precedence.
const temporaryPreferences = new WeakMap<
  Document,
  { mode: ThemeMode; stored: string | null | undefined }
>()

function readStoredTheme() {
  try {
    return window.localStorage.getItem('theme')
  } catch {
    return undefined
  }
}

function normalizeMode(value: string | null | undefined): ThemeMode {
  return value === 'dark' || value === 'auto' ? value : 'light'
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = readStoredTheme()
  const temporary = temporaryPreferences.get(document)
  if (temporary && (stored === undefined || stored === temporary.stored)) {
    return temporary.mode
  }
  temporaryPreferences.delete(document)
  if (stored !== undefined) return normalizeMode(stored)

  const root = document.documentElement
  const current = root.getAttribute('data-theme')
  if (current === 'light' || current === 'dark') return current
  return root.classList.contains('light') || root.classList.contains('dark')
    ? 'auto'
    : 'light'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const t = useT()
  const [mode, setMode] = useState<ThemeMode>('light')
  const currentMode = useRef<ThemeMode>('light')

  useEffect(() => {
    const initialMode = getInitialMode()
    currentMode.current = initialMode
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  useEffect(() => {
    const onLocalChange = (event: Event) => {
      const value: unknown = (event as CustomEvent<unknown>).detail
      if (value !== 'light' && value !== 'dark' && value !== 'auto') return
      currentMode.current = value
      setMode(value)
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'theme' && event.key !== null) return
      try {
        if (event.storageArea !== window.localStorage) return
      } catch {
        return
      }
      temporaryPreferences.delete(document)
      const nextMode = normalizeMode(event.newValue)
      currentMode.current = nextMode
      setMode(nextMode)
      applyThemeMode(nextMode)
    }
    window.addEventListener(THEME_CHANGE_EVENT, onLocalChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onLocalChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (currentMode.current === 'auto') applyThemeMode('auto')
    }

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode =
      currentMode.current === 'light'
        ? 'dark'
        : currentMode.current === 'dark'
          ? 'auto'
          : 'light'
    currentMode.current = nextMode
    setMode(nextMode)
    applyThemeMode(nextMode)
    try {
      window.localStorage.setItem('theme', nextMode)
      temporaryPreferences.delete(document)
    } catch {
      temporaryPreferences.set(document, {
        mode: nextMode,
        stored: readStoredTheme(),
      })
    }
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: nextMode }),
    )
  }

  const label = t(`theme.${mode}`)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleMode}
      aria-label={label}
      title={label}
    >
      {mode === 'auto' ? (
        <DesktopIcon aria-hidden="true" />
      ) : mode === 'dark' ? (
        <MoonIcon aria-hidden="true" />
      ) : (
        <SunIcon aria-hidden="true" />
      )}
    </Button>
  )
}
