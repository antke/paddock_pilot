import { useT } from '#/i18n/LocaleProvider'
import { TextToggleGroup } from '#/components/ui/text-toggle-group'
import type { CareReminderStatusView } from './careReminderListFilters'

/** To do / Done / All above a reminder list; the default view never counts as a filter. */
export function CareReminderStatusToggle({
  value,
  onChange,
}: {
  value: CareReminderStatusView
  onChange: (value: CareReminderStatusView) => void
}) {
  const t = useT()
  return (
    <TextToggleGroup
      label={t('reminders.state')}
      value={value}
      onChange={onChange}
      options={[
        { value: 'pending', label: t('reminders.listTodo') },
        { value: 'completed', label: t('reminders.listDone') },
        { value: 'all', label: t('common.all') },
      ]}
    />
  )
}
