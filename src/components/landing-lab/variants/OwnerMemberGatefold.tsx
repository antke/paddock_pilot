import { cn } from '#/lib/utils'
import { landingLabContent } from '../landingLabContent'
import { LandingLabActions, LandingLabPageFrame } from '../LandingLabPrimitives'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

const gatefoldPlacements = [
  'lg:col-start-1 lg:row-start-1',
  'lg:col-start-2 lg:row-start-1',
  'lg:col-start-1 lg:row-start-2',
  'lg:col-start-2 lg:row-start-2',
] as const

export default function OwnerMemberGatefold({
  theme = 'light',
}: LandingLabVariantProps) {
  return (
    <LandingLabPageFrame theme={theme} headerClassName="border-b-0">
      <main id="main-content" className="landing-overdrive bg-background">
        <section
          aria-labelledby="gatefold-heading"
          className="grid min-h-[calc(100svh-4.5rem)] grid-cols-2 grid-rows-[13rem_auto] border-b border-border sm:grid-rows-[17rem_auto] lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.05fr)_minmax(0,0.8fr)] lg:grid-rows-1"
        >
          <picture className="gatefold-left block overflow-hidden border-r border-b border-border lg:border-b-0">
            <img
              src="/landing-lab/stable-aisle-960.jpg"
              srcSet="/landing-lab/stable-aisle-480.jpg 480w, /landing-lab/stable-aisle-960.jpg 960w, /landing-lab/stable-aisle-1600.jpg 1600w"
              sizes="(min-width: 1024px) 31vw, 50vw"
              alt="A stable aisle connecting the work across the yard"
              width="960"
              height="1440"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div
            className={cn(
              'col-span-2 row-start-2 grid content-center px-5 py-10 sm:px-8 sm:py-14 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:px-9 lg:py-14 xl:px-12',
              theme === 'dark'
                ? 'bg-accent text-accent-foreground'
                : 'bg-primary text-primary-foreground',
            )}
          >
            <h1
              id="gatefold-heading"
              className="max-w-[11ch] font-display text-6xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:text-[clamp(4.5rem,5.4vw,6rem)]"
            >
              {landingLabContent.promise}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 font-semibold opacity-80 sm:text-lg sm:leading-8">
              {landingLabContent.audience}
            </p>
            <LandingLabActions className="mt-8" inverse={theme !== 'dark'} />
          </div>

          <picture className="gatefold-right block overflow-hidden border-b border-border lg:col-start-3 lg:border-b-0 lg:border-l">
            <img
              src="/landing-lab/field-office-panorama-960.jpg"
              srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w"
              sizes="(min-width: 1024px) 31vw, 50vw"
              alt="A horse beside the shared stable yard"
              width="960"
              height="523"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-[68%_center]"
            />
          </picture>
        </section>

        <section
          aria-label="Owner and member responsibilities meeting in one workspace"
          className="gatefold-field grid border-b border-border lg:grid-cols-2 lg:grid-rows-2"
        >
          {landingLabContent.capabilities.map((capability, index) => (
            <article
              key={capability.id}
              className={`${gatefoldPlacements[index]} grid content-center border-b border-border px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[48svh] lg:px-10 lg:py-14 xl:px-14 ${
                index % 2 === 0
                  ? 'gatefold-left bg-secondary text-secondary-foreground lg:border-r'
                  : 'gatefold-right bg-accent text-accent-foreground'
              }`}
            >
              <h2 className="max-w-[12ch] font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] font-bold tracking-[-0.03em] text-balance uppercase">
                {capability.title}
              </h2>
              <p
                className={cn(
                  'mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8',
                  index % 2 === 0
                    ? 'text-secondary-foreground/82'
                    : 'text-accent-foreground/82',
                )}
              >
                {capability.description}
              </p>
              {index === 3 ? <LandingLabActions className="mt-8" /> : null}
            </article>
          ))}
        </section>
      </main>
    </LandingLabPageFrame>
  )
}
