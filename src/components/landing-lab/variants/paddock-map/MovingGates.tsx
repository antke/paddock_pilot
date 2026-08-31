import { landingLabContent } from '../../landingLabContent'
import { LandingLabActions } from '../../LandingLabPrimitives'
import { PaddockMapStudyFrame } from './PaddockMapStudyFrame'

const gatePlacements = [
  'lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start',
  'lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-end',
  'lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:self-center',
  'lg:col-span-5 lg:col-start-8 lg:row-start-3 lg:self-end',
] as const

export function MovingGates({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <PaddockMapStudyFrame
      theme={theme}
      className="paddock-gates-field bg-card text-foreground"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 1780"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g className="paddock-gates-route-track">
          <path
            d="M720 38C694 248 782 404 724 604C660 824 778 998 716 1212C670 1376 730 1532 698 1742"
            fill="none"
            stroke="var(--paddock-gates-route)"
            strokeOpacity="0.18"
            strokeWidth="18"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M720 38C694 248 782 404 724 604C660 824 778 998 716 1212C670 1376 730 1532 698 1742"
            fill="none"
            stroke="var(--paddock-gates-route)"
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        <g
          className="paddock-gates-far"
          fill="none"
          stroke="var(--paddock-gates-rail)"
          strokeOpacity="0.34"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M0 148H384L566 286M860 276L1038 116H1440" />
          <path d="M0 600H316L534 720M884 714L1110 566H1440" />
          <path d="M0 1084H350L550 1196M874 1190L1074 1024H1440" />
          <path d="M0 1540H410L570 1626M856 1618L1030 1488H1440" />
          <path d="M214 0L384 148L316 600L350 1084L410 1540L356 1780" />
          <path d="M1224 0L1038 116L1110 566L1074 1024L1030 1488L1088 1780" />
        </g>

        <g
          className="paddock-gates-near"
          fill="none"
          stroke="var(--paddock-gates-rail)"
          strokeOpacity="0.58"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M0 334H442L586 420M848 414L1008 330H1440" />
          <path d="M0 842H428L570 902M864 898L1024 816H1440" />
          <path d="M0 1320H446L584 1394M850 1388L1018 1294H1440" />
          <path d="M68 0L442 334L428 842L446 1320L238 1780" />
          <path d="M1372 0L1008 330L1024 816L1018 1294L1206 1780" />
        </g>
      </svg>

      <section
        aria-labelledby="paddock-gates-heading"
        className="relative z-10 grid gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:grid-rows-[minmax(calc(100svh-12rem),auto)_34rem_38rem] lg:gap-x-12 lg:gap-y-16 lg:px-10 lg:py-16 xl:px-14"
      >
        <div className="lg:col-span-7 lg:self-center">
          <h1
            id="paddock-gates-heading"
            className="max-w-[11ch] font-display text-6xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:text-[clamp(5rem,6.7vw,6rem)]"
          >
            {landingLabContent.promise}
          </h1>
        </div>

        <div className="max-w-xl lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-base leading-7 font-semibold text-muted-foreground sm:text-lg sm:leading-8">
            {landingLabContent.audience}
          </p>
          <LandingLabActions className="mt-8" />
        </div>

        {landingLabContent.capabilities.map((capability, index) => (
          <article
            key={capability.id}
            className={`${gatePlacements[index]} border-t border-border py-8 lg:py-10`}
          >
            <h2 className="max-w-[12ch] font-display text-[clamp(3rem,6vw,5.4rem)] leading-[0.88] font-bold tracking-[-0.03em] text-balance uppercase">
              {capability.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {capability.description}
            </p>
          </article>
        ))}
      </section>
    </PaddockMapStudyFrame>
  )
}
