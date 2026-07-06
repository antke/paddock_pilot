import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'

type HorseNutritionCardProps = {
  horse: Doc<'horses'>
}

const hasText = (value: string | undefined) => Boolean(value?.trim())
const hasItems = (items: Array<string> | undefined) => Boolean(items?.length)

export function HorseNutritionCard({ horse }: HorseNutritionCardProps) {
  const hasNutrition =
    hasText(horse.feedingRoutine) ||
    hasText(horse.nutritionNotes) ||
    hasItems(horse.nutritionRecommended) ||
    hasItems(horse.nutritionAvoid)

  if (!hasNutrition) return null

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Nutrition</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 text-sm">
        {horse.feedingRoutine && (
          <TextBlock label="Feeding routine" value={horse.feedingRoutine} />
        )}

        {horse.nutritionNotes && (
          <TextBlock label="Nutrition notes" value={horse.nutritionNotes} />
        )}

        {(hasItems(horse.nutritionRecommended) ||
          hasItems(horse.nutritionAvoid)) && (
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function NutritionList({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<string>
  tone: 'positive' | 'negative'
}) {
  if (items.length === 0) return null

  const Icon = tone === 'positive' ? CheckIcon : XIcon
  const iconClassName = tone === 'positive' ? 'text-green-600' : 'text-red-600'

  return (
    <div className="grid gap-2 rounded-row bg-background/55 p-5">
      <h3 className="font-medium">{title}</h3>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Icon className={`mt-0.5 size-4 ${iconClassName}`} weight="bold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
