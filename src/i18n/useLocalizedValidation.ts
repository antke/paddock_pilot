import { useEffect, useRef } from 'react'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import { useLocale } from './LocaleProvider'

// Revalidate only displayed errors. Changing language must not reveal new errors,
// reset fields, or submit a form again.
export function useLocalizedValidation<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, 'formState' | 'trigger'>,
) {
  const { locale } = useLocale()
  const { errors } = form.formState
  const { trigger } = form
  const previousLocale = useRef(locale)
  useEffect(() => {
    if (previousLocale.current === locale) return
    previousLocale.current = locale
    const fields = Object.keys(errors) as Array<FieldPath<T>>
    if (fields.length) void trigger(fields)
  }, [locale, errors, trigger])
}
