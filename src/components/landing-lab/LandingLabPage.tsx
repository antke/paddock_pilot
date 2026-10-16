import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Suspense, useEffect, useId, useState } from 'react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { LandingLabChrome } from './LandingLabChrome'
import { LandingLabThemeBoundary } from './LandingLabThemeBoundary'
import './landingLabOverdrive.css'
import type { LandingLabTheme, LandingLabViewport } from './LandingLabChrome'
import {
  getLandingLabCaptureSource,
  getLandingLabReviewSearch,
} from './landingLabSearch'
import {
  archivedLandingLabVariants,
  currentLandingLabVariants,
  getLandingLabVariant,
} from './landingLabVariants'
import type { LandingLabVariantId } from './landingLabVariants'
import type { PaddockMapVersionId } from './variants/paddock-map/paddockMapVersions'

export function LandingLabGallery({
  selected,
}: {
  selected?: LandingLabVariantId
}) {
  const archiveId = useId()
  const [archiveOpen, setArchiveOpen] = useState(() =>
    archivedLandingLabVariants.some((variant) => variant.id === selected),
  )

  useEffect(() => {
    if (archivedLandingLabVariants.some((variant) => variant.id === selected)) {
      setArchiveOpen(true)
    }
  }, [selected])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-brand-surface-foreground/20 bg-brand-surface text-brand-surface-foreground">
        <div className="grid min-h-[28rem] w-full gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-10 xl:px-12">
          <h1 className="max-w-6xl font-display text-6xl leading-[0.98] font-semibold tracking-[-0.025em] text-balance sm:text-7xl lg:text-8xl">
            Five current directions. One factual product story.
          </h1>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-base leading-7 text-brand-surface-muted-foreground sm:text-lg sm:leading-8">
              Pine &amp; paper, explored through photography, editorial layouts
              and bolder typography. Field Journal refines the current page; the
              other four take it in new directions.
            </p>
            <p className="mt-5 text-sm font-semibold">
              Review only. The live landing page is unchanged.
            </p>
          </div>
        </div>
      </header>

      {selected ? (
        <div className="border-b border-border bg-secondary">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10 xl:px-12">
            <p className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground">
              <CheckCircle className="size-5" weight="fill" />
              Review preference: {getLandingLabVariant(selected)?.label}
            </p>
            <Link
              to="/landing-lab"
              search={{ selected: undefined }}
              className="text-sm font-semibold text-secondary-foreground underline underline-offset-4"
            >
              Clear preference
            </Link>
          </div>
        </div>
      ) : null}

      <LandingLabGalleryRound
        variants={currentLandingLabVariants}
        selected={selected}
        label="Current round"
      />

      <section aria-label="Archived round">
        <div className="border-b border-border bg-surface px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
          <Button
            type="button"
            variant="link"
            aria-expanded={archiveOpen}
            aria-controls={archiveId}
            onClick={() => setArchiveOpen((open) => !open)}
            className="min-h-11 px-0 underline"
          >
            {archiveOpen ? 'Hide' : 'Show'} archived round (5 concepts)
          </Button>
        </div>
        <div id={archiveId}>
          {archiveOpen ? (
            <LandingLabGalleryRound
              variants={archivedLandingLabVariants}
              selected={selected}
              label="Archived concepts"
            />
          ) : null}
        </div>
      </section>
    </main>
  )
}

function LandingLabGalleryRound({
  label,
  selected,
  variants,
}: {
  label: string
  selected?: LandingLabVariantId
  variants: typeof currentLandingLabVariants | typeof archivedLandingLabVariants
}) {
  return (
    <section
      aria-label={label}
      className="divide-y divide-border border-b border-border"
    >
      {variants.map((variant, index) => {
        const isSelected = variant.id === selected
        return (
          <article
            key={variant.id}
            className={cn(
              'grid min-h-[42rem] bg-background lg:grid-cols-[minmax(18rem,0.58fr)_minmax(0,1.42fr)]',
              index % 2 === 1 && 'bg-surface',
              isSelected && 'bg-secondary/55',
            )}
          >
            <div className="flex flex-col justify-between gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
              <div>
                <h2 className="max-w-xl font-display text-5xl leading-[1.05] font-semibold tracking-[-0.02em] sm:text-6xl">
                  {variant.label}
                </h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                  {variant.thesis}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/landing-lab/$variant"
                  params={{ variant: variant.id }}
                  search={getLandingLabReviewSearch({
                    variantId: variant.id,
                    theme: 'light',
                    viewport: 'fit',
                  })}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground no-underline outline-none hover:bg-primary/92 focus-visible:ring-3 focus-visible:ring-ring/25"
                >
                  Open concept <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/landing-lab"
                  search={{ selected: variant.id }}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary underline decoration-border underline-offset-4 outline-none hover:decoration-primary focus-visible:rounded-control focus-visible:ring-3 focus-visible:ring-ring/25"
                >
                  Choose this direction
                </Link>
              </div>
            </div>

            <div className="relative h-[42rem] min-h-0 overflow-hidden border-t border-border bg-surface lg:border-t-0 lg:border-l">
              <iframe
                title={`${variant.label} landing-page preview`}
                src={getLandingLabCaptureSource({
                  variantId: variant.id,
                  theme: 'light',
                })}
                loading="lazy"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-[67rem] w-[160%] origin-top-left scale-[0.625] border-0 bg-background"
              />
            </div>
          </article>
        )
      })}
    </section>
  )
}

export function LandingLabReview({
  mapVersion,
  theme,
  variantId,
  viewport,
}: {
  mapVersion?: PaddockMapVersionId
  theme: LandingLabTheme
  variantId: LandingLabVariantId
  viewport: LandingLabViewport
}) {
  const variant = getLandingLabVariant(variantId)
  if (!variant) return null

  const iframeWidth = viewport === 'fit' ? '100%' : `${viewport}px`
  const source = getLandingLabCaptureSource({
    variantId,
    theme,
    mapVersion,
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingLabChrome
        theme={theme}
        variantId={variantId}
        viewport={viewport}
        mapVersion={mapVersion}
      />
      <main className="bg-surface p-3 sm:p-5">
        <div className="mx-auto max-w-full overflow-auto rounded-panel border border-border bg-muted p-2 sm:p-4">
          <iframe
            key={source}
            title={`${variant.label} responsive preview`}
            src={source}
            style={{ width: iframeWidth }}
            className="mx-auto block h-[calc(100vh-15rem)] min-h-[38rem] max-w-none border border-border bg-background"
          />
        </div>
      </main>
    </div>
  )
}

export function LandingLabCapture({
  mapVersion,
  theme,
  variantId,
}: {
  mapVersion?: PaddockMapVersionId
  theme: LandingLabTheme
  variantId: LandingLabVariantId
}) {
  const variant = getLandingLabVariant(variantId)
  if (!variant) return null
  const Variant = variant.component

  return (
    <LandingLabThemeBoundary theme={theme}>
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-background text-foreground">
            <p className="text-sm font-semibold">Loading {variant.label}…</p>
          </div>
        }
      >
        <Variant theme={theme} versionId={mapVersion} />
      </Suspense>
    </LandingLabThemeBoundary>
  )
}
