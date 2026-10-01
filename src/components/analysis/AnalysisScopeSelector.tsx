import { useT } from '#/i18n/LocaleProvider'
import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import {
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
} from '#/components/ui/autocomplete'

type Scope = { id: string; label: string }

export function AnalysisScopeSelector({
  activeId,
  items,
  onSelect,
}: {
  activeId: string
  items: Array<Scope>
  onSelect: (id: string) => void
}) {
  const t = useT()

  const id = useId()
  const selected = items.find((item) => item.id === activeId) ?? items[0]
  const [query, setQuery] = useState(selected?.label ?? '')
  const highlighted = useRef<Scope | undefined>(undefined)
  useEffect(() => {
    setQuery(selected?.label ?? '')
  }, [selected?.id, selected?.label])
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field className="w-full max-w-md">
        <FieldLabel htmlFor={id}>{t('analysisViews.subject')}</FieldLabel>
        <AutocompleteRoot
          items={items}
          value={query}
          autoHighlight
          openOnInputClick
          itemToStringValue={(item) => item.label}
          filter={(item, value) =>
            value === selected?.label ||
            item.label.toLocaleLowerCase().includes(value.toLocaleLowerCase())
          }
          onItemHighlighted={(item) => {
            highlighted.current = item
          }}
          onValueChange={(value, details) => {
            setQuery(value)
            if (details.reason === 'item-press') {
              const item =
                highlighted.current?.label === value
                  ? highlighted.current
                  : items.find((option) => option.label === value)
              if (item) onSelect(item.id)
            }
          }}
          onOpenChange={(open) => {
            if (!open) setQuery(selected?.label ?? '')
          }}
        >
          <AutocompleteInput
            id={id}
            placeholder={t('analysisViews.subjectSearch')}
            triggerLabel={t('analysisViews.showSubjects')}
          />
          <AutocompleteContent>
            <AutocompleteList>
              {(item: Scope) => (
                <AutocompleteItem
                  key={item.id}
                  value={item}
                  onClick={() => onSelect(item.id)}
                >
                  <span className="whitespace-normal break-words">
                    {item.label}
                  </span>
                </AutocompleteItem>
              )}
            </AutocompleteList>
            <AutocompleteEmpty>
              {t('analysisViews.noSubject')}
            </AutocompleteEmpty>
          </AutocompleteContent>
        </AutocompleteRoot>
      </Field>
      {activeId !== items[0]?.id && (
        <Button variant="outline" onClick={() => onSelect(items[0].id)}>
          {t('analysisViews.stableOverview')}
        </Button>
      )}
    </div>
  )
}
