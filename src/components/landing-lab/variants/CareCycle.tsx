import { cn } from '#/lib/utils'
import { landingLabContent } from '../landingLabContent'
import { LandingLabActions, LandingLabPageFrame } from '../LandingLabPrimitives'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

const cyclePlacements = [
  'lg:left-[4%] lg:top-[8%]',
  'lg:right-[3%] lg:top-[9%]',
  'lg:left-[4%] lg:bottom-[7%]',
  'lg:right-[3%] lg:bottom-[7%]',
] as const

export default function CareCycle({ theme = 'light' }: LandingLabVariantProps) {
  return (
    <LandingLabPageFrame theme={theme}>
      <main id="main-content" className="landing-overdrive bg-background">
        <section
          aria-labelledby="care-cycle-heading"
          className={cn(
            'care-cycle-field relative overflow-hidden border-b border-border px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[calc(100svh-4.5rem)] lg:px-10 lg:py-14 xl:px-14',
            theme === 'dark'
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary text-primary-foreground',
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 390 760"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full lg:hidden"
          >
            <path
              d="M52 650C12 520 22 210 195 92C368 210 378 520 338 650"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              pathLength="1"
              className="care-cycle-progress"
              d="M52 650C12 520 22 210 195 92C368 210 378 520 338 650"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            viewBox="0 0 1000 740"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          >
            <path
              d="M218 575C108 455 116 242 260 126C392 20 620 20 752 126C896 242 904 455 794 575"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="48"
              strokeLinecap="round"
            />
            <path
              pathLength="1"
              className="care-cycle-progress"
              d="M218 575C108 455 116 242 260 126C392 20 620 20 752 126C896 242 904 455 794 575"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative z-10 grid min-h-[32rem] content-center lg:min-h-[calc(100svh-11rem)] lg:place-items-center lg:text-center">
            <div className="max-w-3xl lg:w-[46vw] lg:max-w-[44rem]">
              <h1
                id="care-cycle-heading"
                className="max-w-[11ch] font-display text-6xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:mx-auto lg:max-w-[13ch] lg:text-[clamp(4.25rem,5vw,4.85rem)]"
              >
                {landingLabContent.promise}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 font-semibold opacity-80 sm:text-lg sm:leading-8 lg:mx-auto lg:max-w-xl">
                {landingLabContent.audience}
              </p>
              <LandingLabActions
                className="mt-8 lg:justify-center"
                inverse={theme !== 'dark'}
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-7 border-t border-current/30 pt-8 lg:mt-0 lg:block lg:border-t-0 lg:pt-0">
            {landingLabContent.capabilities.map((capability, index) => (
              <h2
                key={capability.id}
                id={`cycle-${capability.id}`}
                className={`${cyclePlacements[index]} max-w-[12ch] font-display text-4xl leading-[0.9] font-bold tracking-[-0.025em] text-balance uppercase sm:text-5xl lg:absolute lg:max-w-[9ch] lg:text-[clamp(2.5rem,3vw,3.5rem)]`}
              >
                {capability.title}
              </h2>
            ))}
          </div>
        </section>

        <section
          aria-label="The continuing care cycle"
          className="grid border-b border-border lg:grid-cols-2"
        >
          <div className="bg-card px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
            {landingLabContent.capabilities.slice(0, 2).map((capability) => (
              <div
                key={capability.id}
                aria-labelledby={`cycle-${capability.id}`}
                className="border-t border-border py-8 first:border-t-0 first:pt-0 last:pb-0"
              >
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-secondary px-5 py-12 text-secondary-foreground sm:px-8 sm:py-16 lg:border-t-0 lg:border-l lg:px-10 lg:py-20 xl:px-14">
            {landingLabContent.capabilities.slice(2).map((capability) => (
              <div
                key={capability.id}
                aria-labelledby={`cycle-${capability.id}`}
                className="border-t border-secondary-foreground/30 py-8 first:border-t-0 first:pt-0 last:pb-0"
              >
                <p className="max-w-2xl text-base leading-7 text-secondary-foreground/82 sm:text-lg sm:leading-8">
                  {capability.description}
                </p>
              </div>
            ))}
            <LandingLabActions className="mt-10" />
          </div>
        </section>
      </main>
    </LandingLabPageFrame>
  )
}
