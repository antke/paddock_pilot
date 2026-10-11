import { useEffect, useState } from 'react'
import { useT } from '#/i18n/LocaleProvider'

/** Base UI 1.7 hard-codes both screen-reader dismiss labels with no public override.
 * Scope this compatibility adapter to our input/portal containers. It changes only
 * the label; the library continues to own focus, dismissal and popup behavior.
 * Remove when Base UI exposes a localization prop for its internal dismiss button.
 */
export function usePickerDismissTranslation() {
  const t = useT()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const label = t('common.close')
  useEffect(() => {
    if (!container) return
    const update = () => {
      container
        .querySelectorAll<HTMLElement>(
          'span[role="button"][aria-label="Dismiss"], [data-localized-autocomplete-dismiss]',
        )
        .forEach((button) => {
          button.setAttribute('data-localized-autocomplete-dismiss', '')
          button.setAttribute('aria-label', label)
        })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [container, label])
  return setContainer
}
