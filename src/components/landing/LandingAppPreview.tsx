import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DetailKeyValueRow } from '#/components/dashboard/DetailBlocks'
import { TextLabel } from '#/components/ui/text-label'
import { landingPreviewEvents } from './landingContent'
import {
  LandingCompactStack,
  LandingMutedValue,
  LandingPreviewShell,
} from './LandingPrimitives'

export function LandingAppPreview() {
  return (
    <LandingPreviewShell>
      <DashboardInlinePanel
        stack="loose"
        padding="compact"
      >
        <DashboardInlineHeader
          title="Misty"
          description="Chestnut mare"
          aside={
            <DashboardValueBadge variant="secondary">
              Active issue
            </DashboardValueBadge>
          }
          gap="loose"
          titleSize="sm"
          descriptionSize="xs"
        />

        <DashboardInlinePanel chrome="cards" stack="default" padding="compact">
          <TextLabel as="p" tracking="wide">
            Nutrition
          </TextLabel>
          <LandingCompactStack>
            <DetailKeyValueRow
              label="Low-sugar chaff"
              value="Recommended"
              valueTone="positive"
              valueClassName="font-normal"
            />
            <DetailKeyValueRow
              label="Oats"
              value="Avoid"
              valueTone="negative"
              valueClassName="font-normal"
            />
          </LandingCompactStack>
        </DashboardInlinePanel>

        <DashboardItemList gap="compact">
          {landingPreviewEvents.map((event) => (
            <DashboardInlinePanel
              key={event.label}
              chrome="cards"
              padding="tight"
              textSize="sm"
            >
              <DashboardInlineHeader
                title={event.label}
                aside={<LandingMutedValue>{event.detail}</LandingMutedValue>}
              />
            </DashboardInlinePanel>
          ))}
        </DashboardItemList>
      </DashboardInlinePanel>
    </LandingPreviewShell>
  )
}
