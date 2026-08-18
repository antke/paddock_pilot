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
    <figure className="relative pb-1 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 motion-reduce:animate-none lg:pb-0">
      <div className="app-panel-strong overflow-hidden bg-surface">
        <img
          src="/design-moodboards/stable-field-office-hero.png"
          width={1698}
          height={926}
          alt="Chestnut horse standing outside a warm stable yard."
          className="aspect-[4/3] w-full object-cover object-center sm:aspect-[16/10] lg:aspect-[16/11]"
          fetchPriority="high"
        />
      </div>

      <div className="relative z-10 mx-3 -mt-16 sm:mx-6 sm:-mt-24 lg:absolute lg:bottom-6 lg:left-6 lg:mx-0 lg:mt-0 lg:w-[62%]">
        <LandingPreviewShell
          aria-label="Example Paddock Pilot horse care preview for Juniper"
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-150 motion-safe:duration-300 motion-reduce:animate-none"
        >
          <DashboardInlinePanel stack="loose" padding="compact">
            <DashboardInlineHeader
              title="Juniper"
              description="Dutch Warmblood mare"
              aside={
                <DashboardValueBadge variant="secondary">
                  Needs care
                </DashboardValueBadge>
              }
              gap="loose"
              titleSize="sm"
              descriptionSize="xs"
            />

            <DashboardInlinePanel
              chrome="cards"
              stack="default"
              padding="compact"
            >
              <TextLabel as="p" tracking="wide">
                Nutrition
              </TextLabel>
              <LandingCompactStack>
                <DetailKeyValueRow
                  label="Low-starch ration"
                  value="Current"
                  valueTone="positive"
                  valueClassName="font-normal"
                />
                <DetailKeyValueRow
                  label="Senior supplement"
                  value="Order due"
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
                    aside={
                      <LandingMutedValue>{event.detail}</LandingMutedValue>
                    }
                  />
                </DashboardInlinePanel>
              ))}
            </DashboardItemList>
          </DashboardInlinePanel>
        </LandingPreviewShell>
      </div>

      <figcaption className="sr-only">
        Stable photography paired with an example Paddock Pilot horse record and
        care schedule.
      </figcaption>
    </figure>
  )
}
