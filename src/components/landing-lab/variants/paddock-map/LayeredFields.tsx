import { landingLabContent } from '../../landingLabContent'
import { LandingLabActions } from '../../LandingLabPrimitives'
import { PaddockMapStudyFrame } from './PaddockMapStudyFrame'

const fieldPlacements = [
  'lg:col-span-4 lg:col-start-2 lg:row-start-2 lg:self-start',
  'lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-end',
  'lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:self-center',
  'lg:col-span-5 lg:col-start-7 lg:row-start-3 lg:self-end',
] as const

export function LayeredFields({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <PaddockMapStudyFrame
      theme={theme}
      className="paddock-layered-field bg-secondary text-secondary-foreground"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 1760"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M0 82L522 26L706 354L514 720L0 650Z"
          fill="var(--paddock-layer-a)"
        />
        <path
          d="M522 26L1440 0V526L1090 690L706 354Z"
          fill="var(--paddock-layer-b)"
        />
        <path
          d="M0 650L514 720L624 1196L310 1480L0 1386Z"
          fill="var(--paddock-layer-c)"
        />
        <path
          d="M514 720L1090 690L1440 526V1260L1118 1574L624 1196Z"
          fill="var(--paddock-layer-d)"
        />
        <path
          d="M310 1480L624 1196L1118 1574L1440 1260V1760H0V1386Z"
          fill="var(--paddock-layer-e)"
        />

        <path
          d="M0 82L522 26L706 354L1090 690L1440 526M0 650L514 720L624 1196L310 1480M514 720L1090 690M624 1196L1118 1574L1440 1260"
          fill="none"
          stroke="var(--paddock-layer-rail)"
          strokeOpacity="0.46"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M248 54L352 674M884 18L908 632M112 666L76 1404M1178 648L1216 1478M324 1480L414 1760"
          fill="none"
          stroke="var(--paddock-layer-rail)"
          strokeOpacity="0.22"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M84 1530C242 1364 196 1040 380 924C562 810 548 420 778 348C1010 276 958 718 1170 778C1350 828 1250 1160 1070 1254C894 1346 756 1460 644 1694"
          fill="none"
          stroke="var(--paddock-layer-route)"
          strokeOpacity="0.22"
          strokeWidth="11"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          pathLength="1"
          className="paddock-layered-route"
          d="M84 1530C242 1364 196 1040 380 924C562 810 548 420 778 348C1010 276 958 718 1170 778C1350 828 1250 1160 1070 1254C894 1346 756 1460 644 1694"
          fill="none"
          stroke="var(--paddock-layer-route)"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <section
        aria-labelledby="paddock-layered-heading"
        className="relative z-10 grid gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:grid-rows-[minmax(calc(100svh-12rem),auto)_33rem_37rem] lg:gap-x-8 lg:gap-y-16 lg:px-10 lg:py-16 xl:px-14"
      >
        <div className="lg:col-span-7 lg:self-center">
          <h1
            id="paddock-layered-heading"
            className="max-w-[11ch] font-display text-6xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:text-[clamp(5rem,6.7vw,6rem)]"
          >
            {landingLabContent.promise}
          </h1>
        </div>

        <div className="max-w-xl lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-base leading-7 font-semibold sm:text-lg sm:leading-8">
            {landingLabContent.audience}
          </p>
          <LandingLabActions className="mt-8" />
        </div>

        {landingLabContent.capabilities.map((capability, index) => (
          <article
            key={capability.id}
            className={`${fieldPlacements[index]} relative border-t border-current/30 py-8 lg:py-10`}
          >
            <h2 className="max-w-[12ch] font-display text-[clamp(3rem,6vw,5.4rem)] leading-[0.88] font-bold tracking-[-0.03em] text-balance uppercase">
              {capability.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 opacity-80 sm:text-lg sm:leading-8">
              {capability.description}
            </p>
          </article>
        ))}
      </section>
    </PaddockMapStudyFrame>
  )
}
