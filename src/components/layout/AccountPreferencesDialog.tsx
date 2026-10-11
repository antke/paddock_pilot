import type { ComponentProps } from 'react'
import ThemeToggle, { ThemePreferenceSync } from '#/components/ThemeToggle'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { LanguageSelector } from '#/i18n/LanguageSelector'
import { useT } from '#/i18n/LocaleProvider'

export function AccountPreferencesDialog({
  open,
  onOpenChange,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  finalFocus?: ComponentProps<typeof DialogContent>['finalFocus']
}) {
  const t = useT()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ThemePreferenceSync />
      <DialogContent finalFocus={finalFocus} aria-describedby={undefined}>
        <DialogHeader className="pr-8">
          <DialogTitle>{t('navigation.accountPreferences')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5">
          <LanguageSelector />
          <fieldset className="grid min-w-0 gap-1">
            <legend className="mb-1 text-sm font-medium">
              {t('navigationShell.appearance')}
            </legend>
            <ThemeToggle showLabel />
          </fieldset>
        </div>
      </DialogContent>
    </Dialog>
  )
}
