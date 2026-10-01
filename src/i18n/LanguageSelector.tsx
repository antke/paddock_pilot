import { Select } from '#/components/ui/select'
import { FieldLabel } from '#/components/ui/field'
import { useId } from 'react'
import { useLocale, useT } from './LocaleProvider'
import { Button } from '#/components/ui/button'
import { isLocale } from '../../shared/i18n/locale'

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, changeLocale, saving, saveFailed, ready } = useLocale()
  const t = useT()
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <FieldLabel
        htmlFor={id}
        className={compact ? 'sr-only' : 'text-sm font-medium'}
      >
        {t('language.label')}
      </FieldLabel>
      <Select
        id={id}
        value={locale}
        disabled={!ready || saving}
        onChange={(event) => {
          if (isLocale(event.target.value))
            void changeLocale(event.target.value)
        }}
        aria-describedby={saveFailed ? `${id}-error` : undefined}
        className={compact ? 'min-h-9 py-1' : undefined}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="pl" lang="pl">
          Polski
        </option>
      </Select>
      {saving && (
        <span role="status" className="sr-only">
          {t('language.saving')}
        </span>
      )}
      {saveFailed && (
        <div
          id={`${id}-error`}
          role="alert"
          className="max-w-xs text-sm text-destructive"
        >
          <p>{t('language.saveFailed')}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto whitespace-normal"
            onClick={() => void changeLocale(locale)}
          >
            {t('language.retry')}
          </Button>
        </div>
      )}
    </div>
  )
}
