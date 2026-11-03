import { useT } from '#/i18n/LocaleProvider'
import {
  DetailGrid,
  DetailIconList,
  DetailPanel,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import type { DetailTone } from '#/components/dashboard/DetailBlocks'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'

type HorseNutritionCardProps = {
  horse: Doc<'horses'>
  showHeader?: boolean
  /** Contextual editor entry; keeps the plan visible to editors when empty. */
  editAction?: ReactNode
}

const hasText = (value: string | undefined) => Boolean(value?.trim())
const hasItems = (items: Array<string> | undefined) => Boolean(items?.length)

export function HorseNutritionCard({
  horse,
  showHeader = true,
  editAction,
}: HorseNutritionCardProps) {
  const t = useT()

  const hasNutrition =
    hasText(horse.feedingRoutine) ||
    hasText(horse.nutritionNotes) ||
    hasItems(horse.nutritionRecommended) ||
    hasItems(horse.nutritionAvoid)

  if (!hasNutrition && !editAction) return null

  const content = (
    <>
      {!hasNutrition && (
        <p className="text-muted-foreground">{t('horseDetail.notRecorded')}</p>
      )}
      {horse.feedingRoutine && (
        <DetailTextBlock
          label={t('careRecords.feedingRoutine')}
          labelProps={{ size: 'sm' }}
        >
          {horse.feedingRoutine}
        </DetailTextBlock>
      )}

      {horse.nutritionNotes && (
        <DetailTextBlock
          label={t('careRecords.nutritionNotes')}
          labelProps={{ size: 'sm' }}
        >
          {horse.nutritionNotes}
        </DetailTextBlock>
      )}

      {(hasItems(horse.nutritionRecommended) ||
        hasItems(horse.nutritionAvoid)) && (
        <DetailGrid breakpoint="md" gap="default">
          <NutritionList
            title={t('careRecords.recommended')}
            items={horse.nutritionRecommended ?? []}
            tone="positive"
          />
          <NutritionList
            title={t('careRecords.avoid')}
            items={horse.nutritionAvoid ?? []}
            tone="negative"
          />
        </DetailGrid>
      )}
    </>
  )

  if (!showHeader)
    return (
      <DashboardSubsection
        title={t('careRecords.currentFeedingPlan')}
        edit={editAction}
        className="rounded-row bg-surface-muted p-4 sm:p-5"
        contentClassName="grid gap-4 text-sm"
      >
        {content}
      </DashboardSubsection>
    )

  return (
    <DashboardSectionCard
      title={t('careRecords.nutrition')}
      contentTextSize="sm"
      edit={editAction}
    >
      {content}
    </DashboardSectionCard>
  )
}

function NutritionList({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<string>
  tone: Extract<DetailTone, 'positive' | 'negative'>
}) {
  if (items.length === 0) return null

  return (
    <DetailPanel title={title} gap="compact">
      <DetailIconList
        icon={tone === 'positive' ? CheckIcon : XIcon}
        iconTone={tone}
        items={items}
      />
    </DetailPanel>
  )
}
