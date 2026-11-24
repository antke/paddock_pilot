import { useId, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { showAppErrorToast } from '#/components/ui/sonner'
import { currencies, isCurrency } from '../../shared/i18n/currency'
import { useLocale, useT } from './LocaleProvider'

export function CurrencySelector() {
  const { locale, currency } = useLocale()
  const t = useT()
  const id = useId()
  const save = useMutation(api.users.setCurrency)
  const [saving, setSaving] = useState(false)
  const names = new Intl.DisplayNames(locale, { type: 'currency' })
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <FieldLabel htmlFor={id} className="text-sm font-medium">
        {t('currency.label')}
      </FieldLabel>
      <Select
        id={id}
        value={currency}
        disabled={saving}
        onChange={async (event) => {
          if (!isCurrency(event.target.value)) return
          setSaving(true)
          try {
            await save({ currency: event.target.value })
          } catch {
            showAppErrorToast({ title: t('currency.saveFailed') })
          } finally {
            setSaving(false)
          }
        }}
      >
        {currencies.map((code) => (
          <option key={code} value={code}>
            {names.of(code)} ({code})
          </option>
        ))}
      </Select>
    </div>
  )
}
