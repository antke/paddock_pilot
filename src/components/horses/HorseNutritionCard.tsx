import {
  DetailGrid,
  DetailIconList,
  DetailPanel,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import type { DetailTone } from '#/components/dashboard/DetailBlocks'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'

type HorseNutritionCardProps = {
  horse: Doc<'horses'>
  showHeader?: boolean
}

const hasText = (value: string | undefined) => Boolean(value?.trim())
const hasItems = (items: Array<string> | undefined) => Boolean(items?.length)

export function HorseNutritionCard({
  horse,
  showHeader = true,
}: HorseNutritionCardProps) {
  const hasNutrition =
    hasText(horse.feedingRoutine) ||
    hasText(horse.nutritionNotes) ||
    hasItems(horse.nutritionRecommended) ||
    hasItems(horse.nutritionAvoid)

  if (!hasNutrition) return null

  const content = (
    <>
      {horse.feedingRoutine && (
        <DetailTextBlock label="Feeding routine" labelProps={{ size: 'sm' }}>
          {horse.feedingRoutine}
        </DetailTextBlock>
      )}

      {horse.nutritionNotes && (
        <DetailTextBlock label="Nutrition notes" labelProps={{ size: 'sm' }}>
          {horse.nutritionNotes}
        </DetailTextBlock>
      )}

      {(hasItems(horse.nutritionRecommended) ||
        hasItems(horse.nutritionAvoid)) && (
        <DetailGrid breakpoint="md" gap="default">
          <NutritionList
            title="Recommended"
            items={horse.nutritionRecommended ?? []}
            tone="positive"
          />
          <NutritionList
            title="Avoid"
            items={horse.nutritionAvoid ?? []}
            tone="negative"
          />
        </DetailGrid>
      )}
    </>
  )

  if (!showHeader) return content

  return (
    <DashboardSectionCard title="Nutrition" contentTextSize="sm">
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
