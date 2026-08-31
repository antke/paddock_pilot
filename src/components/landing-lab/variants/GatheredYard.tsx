import { landingLabContent } from '../landingLabContent'
import { LandingLabActions, LandingLabPageFrame } from '../LandingLabPrimitives'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

const fragmentClasses = [
  'gathered-from-left absolute top-7 left-5 lg:static lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:self-end',
  'gathered-from-top absolute top-7 right-5 text-right lg:static lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:text-left',
  'gathered-from-bottom absolute top-[calc(100svh+1.5rem)] left-5 lg:static lg:col-span-4 lg:col-start-1 lg:row-start-3',
  'gathered-from-right absolute top-[calc(100svh+1.5rem)] right-5 text-right lg:static lg:col-span-4 lg:col-start-9 lg:row-start-3 lg:self-start lg:text-left',
] as const

export default function GatheredYard({
  theme = 'light',
}: LandingLabVariantProps) {
  return (
    <LandingLabPageFrame theme={theme}>
      <main id="main-content" className="landing-overdrive bg-background">
        <section
          aria-labelledby="gathered-yard-heading"
          className="gathered-convergence relative min-h-[125svh] border-b border-border bg-surface lg:min-h-[142svh]"
        >
          <div className="relative grid min-h-[125svh] place-items-center gap-9 px-5 py-36 sm:px-8 lg:sticky lg:top-0 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:place-items-stretch lg:items-center lg:gap-6 lg:px-10 lg:py-8 xl:px-14">
            <div className="relative z-10 lg:col-span-6 lg:col-start-4 lg:row-start-2 lg:text-center">
              <h1
                id="gathered-yard-heading"
                className="mx-auto max-w-[12ch] font-display text-5xl leading-[0.86] font-black tracking-[-0.035em] text-balance uppercase sm:text-6xl lg:max-w-[16ch] lg:text-[clamp(4rem,4.8vw,5rem)]"
              >
                {landingLabContent.promise}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 font-semibold text-muted-foreground sm:text-lg sm:leading-8">
                {landingLabContent.audience}
              </p>
              <LandingLabActions className="mt-8 lg:justify-center" />
            </div>

            {landingLabContent.capabilities.map((capability, index) => (
              <h2
                key={capability.id}
                id={`gathered-${capability.id}`}
                className={`${fragmentClasses[index]} max-w-[8ch] font-display text-3xl leading-[0.9] font-bold tracking-[-0.025em] text-balance uppercase sm:max-w-[9ch] sm:text-3xl lg:max-w-[12ch] lg:text-[clamp(2.5rem,3.4vw,3.75rem)]`}
              >
                {capability.title}
              </h2>
            ))}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border"
            />
          </div>
        </section>

        <section
          aria-label="How Paddock Pilot brings stable care together"
          className="grid border-b border-border bg-card lg:grid-cols-2"
        >
          {landingLabContent.capabilities.map((capability, index) => (
            <article
              key={capability.id}
              aria-labelledby={`gathered-${capability.id}`}
              className={`grid content-center px-5 py-10 sm:px-8 sm:py-12 lg:min-h-72 lg:px-10 xl:px-14 ${
                index % 2 === 0 ? 'lg:border-r lg:border-border' : ''
              } ${index < 2 ? 'border-b border-border' : ''}`}
            >
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {capability.description}
              </p>
            </article>
          ))}
        </section>

        <picture className="block h-52 overflow-hidden border-b border-border sm:h-72 lg:h-[24rem]">
          <img
            src="/landing-lab/field-office-panorama-1600.jpg"
            srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w"
            sizes="100vw"
            alt="A horse beside a stable yard at golden hour"
            width="1600"
            height="872"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[center_58%]"
          />
        </picture>
      </main>
    </LandingLabPageFrame>
  )
}
