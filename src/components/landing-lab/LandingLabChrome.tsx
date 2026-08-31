import { Check, Copy, Monitor, Moon, Sun } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  getLandingLabCaptureUrl,
  getLandingLabReviewSearch,
} from './landingLabSearch'
import { landingLabVariants } from './landingLabVariants'
import type { LandingLabVariantId } from './landingLabVariants'
import {
  paddockMapVersions,
  resolvePaddockMapVersionId,
} from './variants/paddock-map/paddockMapVersions'
import type { PaddockMapVersionId } from './variants/paddock-map/paddockMapVersions'

export type LandingLabTheme = 'light' | 'dark'
export type LandingLabViewport = 'fit' | '390' | '768' | '1440'

export function LandingLabChrome({
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
  const [copyStatus, setCopyStatus] = useState('')
  const activeMapVersion = resolvePaddockMapVersionId(mapVersion)

  async function copyCaptureUrl() {
    const url = getLandingLabCaptureUrl({
      currentHref: window.location.href,
      variantId,
      theme,
      mapVersion,
    })

    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('Capture link copied')
    } catch {
      setCopyStatus('Copy failed; use the address bar')
    }
  }

  return (
    <header className="border-b border-border bg-surface px-4 py-4">
      <div className="mx-auto grid w-full max-w-[96rem] gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/landing-lab"
              className="font-serif text-lg font-bold text-foreground no-underline hover:text-primary"
            >
              Landing concepts
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Review only · the live landing page is unchanged
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-control border border-border bg-surface-elevated p-1"
              aria-label="Preview theme"
            >
              {(['light', 'dark'] as const).map((themeOption) => (
                <Link
                  key={themeOption}
                  to="/landing-lab/$variant"
                  params={{ variant: variantId }}
                  search={getLandingLabReviewSearch({
                    variantId,
                    theme: themeOption,
                    viewport,
                    mapVersion,
                  })}
                  aria-label={`Use ${themeOption} theme`}
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-control text-muted-foreground no-underline outline-none hover:bg-primary/8 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25',
                    theme === themeOption &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  {themeOption === 'light' ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyCaptureUrl}>
              <Copy />
              Copy capture link
            </Button>
          </div>
        </div>

        <nav
          aria-label="Landing concept variants"
          className="overflow-x-auto pb-1"
        >
          <div className="flex min-w-max gap-2">
            {landingLabVariants.map((variant) => (
              <Link
                key={variant.id}
                to="/landing-lab/$variant"
                params={{ variant: variant.id }}
                search={getLandingLabReviewSearch({
                  variantId: variant.id,
                  theme,
                  viewport,
                  mapVersion,
                })}
                aria-current={variant.id === variantId ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-control border border-border bg-surface-elevated px-3 text-sm font-semibold text-foreground no-underline outline-none hover:border-primary hover:bg-primary/8 focus-visible:ring-3 focus-visible:ring-ring/25',
                  variant.id === variantId &&
                    'border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                )}
              >
                {variant.label}
              </Link>
            ))}
          </div>
        </nav>

        {variantId === 'paddock-map' ? (
          <nav
            aria-label="Paddock Map versions"
            className="overflow-x-auto border-t border-border pt-3 pb-1"
          >
            <div className="flex min-w-max items-center gap-1">
              {paddockMapVersions.map((version) => (
                <Link
                  key={version.id}
                  to="/landing-lab/$variant"
                  params={{ variant: variantId }}
                  search={getLandingLabReviewSearch({
                    variantId,
                    theme,
                    viewport,
                    mapVersion: version.id,
                  })}
                  activeOptions={{ exact: true }}
                  aria-current={
                    version.id === activeMapVersion ? 'page' : undefined
                  }
                  className={cn(
                    'inline-flex min-h-9 items-center rounded-control px-3 text-xs font-bold tracking-[0.04em] text-muted-foreground uppercase no-underline outline-none hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-3 focus-visible:ring-ring/25',
                    version.id === activeMapVersion &&
                      'bg-secondary text-secondary-foreground',
                  )}
                >
                  {version.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Preview viewport"
          >
            <Monitor className="size-4 text-muted-foreground" />
            {(['fit', '390', '768', '1440'] as const).map((viewportOption) => (
              <Link
                key={viewportOption}
                to="/landing-lab/$variant"
                params={{ variant: variantId }}
                search={getLandingLabReviewSearch({
                  variantId,
                  theme,
                  viewport: viewportOption,
                  mapVersion,
                })}
                className={cn(
                  'inline-flex min-h-8 items-center rounded-control px-2.5 text-xs font-semibold text-muted-foreground no-underline outline-none hover:bg-primary/8 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25',
                  viewport === viewportOption &&
                    'bg-secondary text-secondary-foreground',
                )}
              >
                {viewportOption === 'fit' ? 'Fit' : `${viewportOption}px`}
              </Link>
            ))}
          </div>
          <Link
            to="/landing-lab"
            search={{ selected: variantId }}
            className="inline-flex min-h-10 items-center gap-2 rounded-control border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground no-underline outline-none hover:bg-primary/92 focus-visible:ring-3 focus-visible:ring-ring/25"
          >
            <Check className="size-4" />
            Choose this direction
          </Link>
        </div>
        <p className="sr-only" aria-live="polite">
          {copyStatus}
        </p>
      </div>
    </header>
  )
}
