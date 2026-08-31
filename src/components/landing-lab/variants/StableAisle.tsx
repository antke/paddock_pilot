import { landingLabContent } from '../landingLabContent'
import { LandingLabActions, LandingLabPageFrame } from '../LandingLabPrimitives'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

const aislePlacements = [
  'lg:col-start-1 lg:row-start-1',
  'lg:col-start-3 lg:row-start-1',
  'lg:col-start-1 lg:row-start-2',
  'lg:col-start-3 lg:row-start-2',
] as const

export default function StableAisle({
  theme = 'light',
}: LandingLabVariantProps) {
  return (
    <LandingLabPageFrame theme={theme}>
      <main id="main-content" className="landing-overdrive bg-background">
        <section
          aria-labelledby="stable-aisle-heading"
          className="grid border-b border-border lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)_minmax(0,0.8fr)]"
        >
          <div className="grid content-center bg-primary px-5 py-8 text-primary-foreground sm:px-8 sm:py-14 lg:px-8 lg:py-10 xl:px-11">
            <h1
              id="stable-aisle-heading"
              className="max-w-[10ch] font-display text-5xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:max-w-[12ch] lg:text-[clamp(3.75rem,4.4vw,5.25rem)]"
            >
              {landingLabContent.promise}
            </h1>
          </div>

          <picture className="aisle-depth order-2 block h-40 overflow-hidden border-y border-border sm:h-[30rem] lg:order-none lg:h-full lg:border-x lg:border-y-0">
            <img
              src="/landing-lab/stable-aisle-1600.jpg"
              srcSet="/landing-lab/stable-aisle-480.jpg 480w, /landing-lab/stable-aisle-960.jpg 960w, /landing-lab/stable-aisle-1600.jpg 1600w"
              sizes="(min-width: 1024px) 52vw, 100vw"
              alt="A clear central aisle between horse stalls"
              width="1600"
              height="2400"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div className="order-3 grid content-center bg-secondary px-5 py-7 text-secondary-foreground sm:px-8 sm:py-12 lg:order-none lg:px-7 lg:py-10 xl:px-10">
            <p className="max-w-xl text-base leading-7 font-semibold sm:text-lg sm:leading-8">
              {landingLabContent.audience}
            </p>
            <LandingLabActions className="mt-8" />
          </div>
        </section>

        <section
          aria-label="Stable and horse care in one shared aisle"
          className="grid bg-card lg:grid-cols-[minmax(0,1fr)_minmax(12rem,20vw)_minmax(0,1fr)] lg:grid-rows-2"
        >
          <picture
            aria-hidden="true"
            className="aisle-depth block h-64 overflow-hidden border-b border-border lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-screen lg:border-x lg:border-b-0"
          >
            <img
              src="/landing-lab/stable-aisle-960.jpg"
              alt=""
              width="960"
              height="1440"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          {landingLabContent.capabilities.map((capability, index) => (
            <article
              key={capability.id}
              className={`${aislePlacements[index]} grid content-center border-b border-border px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[50svh] lg:px-10 lg:py-14 xl:px-14 ${
                index === 1 || index === 3 ? 'bg-surface' : 'bg-card'
              }`}
            >
              <h2 className="max-w-[12ch] font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] font-bold tracking-[-0.03em] text-balance uppercase">
                {capability.title}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
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
