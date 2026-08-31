import { CalendarCheck, ClipboardText, Horse } from '@phosphor-icons/react'

import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import { ButtonAnchor, ButtonLink } from '#/components/ui/button'
import { TextLabel } from '#/components/ui/text-label'
import { LandingAppPreview } from './LandingAppPreview'
import { LandingProductProof } from './LandingProductProof'
import {
  landingFaqs,
  landingOutcomes,
  landingWorkflowSteps,
} from './landingContent'
import {
  LandingActionRow,
  LandingCopyBlock,
  LandingEyebrow,
  LandingFaqList,
  LandingHeroActionStack,
  LandingHeroGrid,
  LandingLead,
  LandingOutcomeRail,
  LandingPageShell,
  LandingSection,
  LandingTitle,
} from './LandingPrimitives'

const workflowIcons = {
  calendar: CalendarCheck,
  handoff: ClipboardText,
  horse: Horse,
}

export function PublicLandingPage() {
  return (
    <LandingPageShell>
      <div className="grid gap-6">
        <LandingHeroGrid aria-labelledby="landing-hero-title">
          <LandingHeroActionStack>
            <LandingCopyBlock width="wide">
              <LandingEyebrow>
                Horse care, without the paper chase
              </LandingEyebrow>
              <LandingTitle id="landing-hero-title" as="h1" size="hero">
                Keep the whole yard on the same page.
              </LandingTitle>
              <LandingLead size="hero">
                Paddock Pilot brings horse records, care reminders, schedules,
                nutrition notes, and provider details into one calm field office
                for owners and stable admins.
              </LandingLead>
            </LandingCopyBlock>

            <LandingActionRow>
              <ButtonLink to="/sign-up/$" variant="solid" size="lg">
                Create your account
              </ButtonLink>
              <ButtonAnchor href="#product-proof" variant="outline" size="lg">
                See how it works
              </ButtonAnchor>
            </LandingActionRow>

            <p className="text-sm text-muted-foreground">
              Add your stable, then build the first horse profile.
            </p>
          </LandingHeroActionStack>

          <LandingAppPreview />
        </LandingHeroGrid>

        <LandingOutcomeRail items={landingOutcomes} />
      </div>

      <LandingSection
        id="product-proof"
        tone="card"
        aria-labelledby="product-proof-title"
      >
        <LandingCopyBlock width="wide">
          <LandingEyebrow>Built for the work between visits</LandingEyebrow>
          <LandingTitle id="product-proof-title">
            The whole yard, without the whiteboard scramble.
          </LandingTitle>
          <LandingLead className="max-w-3xl">
            Start with today’s work, open the horse when you need context, and
            keep the provider visit connected to both.
          </LandingLead>
        </LandingCopyBlock>

        <LandingProductProof />
      </LandingSection>

      <LandingSection tone="soft" aria-labelledby="workflow-title">
        <LandingCopyBlock width="wide">
          <LandingEyebrow>One calm working rhythm</LandingEyebrow>
          <LandingTitle id="workflow-title">
            Care moves. The context moves with it.
          </LandingTitle>
          <LandingLead className="max-w-3xl">
            Paddock Pilot follows the real flow of stable care—from planning the
            work to recording what happened and preparing the next handoff.
          </LandingLead>
        </LandingCopyBlock>

        <ol className="grid gap-4 lg:grid-cols-3">
          {landingWorkflowSteps.map((step) => {
            const Icon = workflowIcons[step.icon]

            return (
              <li
                key={step.label}
                className={dashboardItemCardClassName({
                  accent: step.tone,
                  className: 'grid content-start gap-4 bg-card',
                })}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-control border border-border-subtle bg-surface-elevated text-primary">
                    <Icon aria-hidden="true" className="size-5" weight="bold" />
                  </span>
                  <TextLabel as="span" className="text-muted-foreground">
                    {step.label}
                  </TextLabel>
                </div>
                <div className="grid gap-2">
                  <LandingTitle as="h3" size="panel">
                    {step.title}
                  </LandingTitle>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </LandingSection>

      <LandingSection
        className="gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"
        aria-label="Plans and common questions"
      >
        <div className="grid gap-6">
          <LandingCopyBlock>
            <LandingEyebrow>Simple plans, when billing begins</LandingEyebrow>
            <LandingTitle>Core coordination stays complete.</LandingTitle>
            <LandingLead>
              During testing, every feature is included. Later, only the
              Analysis Centre will sit in the premium tier.
            </LandingLead>
          </LandingCopyBlock>

          <div className="grid gap-3">
            <DashboardInlinePanel
              chrome="cards"
              padding="compact"
              stack="default"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LandingTitle as="h3" size="panel">
                  Core
                </LandingTitle>
                <DashboardValueBadge variant="secondary">
                  Everyday care
                </DashboardValueBadge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Stable access, horse management, documents, care summaries,
                events, and reminders for everyday coordination.
              </p>
            </DashboardInlinePanel>

            <DashboardInlinePanel
              chrome="cards"
              padding="compact"
              stack="default"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LandingTitle as="h3" size="panel">
                  Premium
                </LandingTitle>
                <DashboardValueBadge variant="default">
                  Deeper insight
                </DashboardValueBadge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Adds the Analysis Centre for deeper stable-wide care and
                activity insight.
              </p>
            </DashboardInlinePanel>
          </div>

          <LandingActionRow>
            <ButtonLink to="/pricing">Compare plans</ButtonLink>
            <ButtonLink to="/sign-up/$" variant="outline">
              Create account
            </ButtonLink>
          </LandingActionRow>
        </div>

        <div className="grid gap-6">
          <LandingCopyBlock>
            <LandingEyebrow>Before you saddle up</LandingEyebrow>
            <LandingTitle>Common questions, clear answers.</LandingTitle>
            <LandingLead>
              A quick look at what belongs in the system and how shared care
              works.
            </LandingLead>
          </LandingCopyBlock>

          <LandingFaqList items={landingFaqs} />
        </div>
      </LandingSection>

      <LandingSection
        tone="brand"
        className="justify-items-center gap-5 text-center"
        aria-labelledby="landing-cta-title"
      >
        <LandingEyebrow className="text-primary-foreground/70">
          Your next clear care decision starts here
        </LandingEyebrow>
        <LandingTitle id="landing-cta-title" className="max-w-3xl" size="cta">
          Put the next care decision within reach.
        </LandingTitle>
        <LandingLead size="brand">
          Create your stable workspace and start keeping each horse’s schedule,
          records, and care context together.
        </LandingLead>
        <LandingActionRow className="justify-center">
          <ButtonLink to="/sign-up/$" variant="secondary" size="lg">
            Create your account
          </ButtonLink>
          <ButtonLink to="/pricing" variant="outline" size="lg">
            Compare plans
          </ButtonLink>
        </LandingActionRow>
      </LandingSection>
    </LandingPageShell>
  )
}
