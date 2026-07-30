import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { ButtonLink } from '#/components/ui/button'
import { LandingAppPreview } from './LandingAppPreview'
import { landingCareItems } from './landingContent'
import {
  LandingCopyBlock,
  LandingCtaSection,
  LandingFeatureList,
  LandingHeroActionStack,
  LandingHeroGrid,
  LandingLead,
  LandingPageShell,
  LandingSplitSection,
  LandingTitle,
} from './LandingPrimitives'

export function PublicLandingPage() {
  return (
    <LandingPageShell>
      <LandingHeroGrid>
        <LandingHeroActionStack>
          <LandingCopyBlock width="wide">
            <LandingTitle as="h1" size="hero">
              Manage horse care without notebook, whiteboard, and text-message
              chaos.
            </LandingTitle>
            <LandingLead size="hero">
              Paddock Pilot gives owners and stable admins one shared place for
              horse records, nutrition notes, health issues, and upcoming care
              appointments.
            </LandingLead>
          </LandingCopyBlock>

          <DashboardActions align="start">
            <ButtonLink to="/sign-up/$">Create account</ButtonLink>
            <ButtonLink to="/sign-in/$" variant="outline">
              Sign in
            </ButtonLink>
          </DashboardActions>
        </LandingHeroActionStack>

        <LandingAppPreview />
      </LandingHeroGrid>

      <LandingSplitSection>
        <LandingCopyBlock>
          <LandingTitle>
            Keep the care details close to the schedule.
          </LandingTitle>
          <LandingLead>
            When a vet, farrier, dentist, or stable admin needs context, the
            important notes are already connected to the horse and the shared
            stable calendar.
          </LandingLead>
        </LandingCopyBlock>

        <LandingFeatureList items={landingCareItems} />
      </LandingSplitSection>

      <LandingCtaSection>
        <LandingTitle className="max-w-2xl" size="cta">
          Start replacing scattered care notes today.
        </LandingTitle>
        <LandingLead size="brand">
          Create an account, add a stable, and begin building clear horse care
          profiles for your yard.
        </LandingLead>
        <ButtonLink to="/sign-up/$" variant="secondary">
          Get started
        </ButtonLink>
      </LandingCtaSection>
    </LandingPageShell>
  )
}
