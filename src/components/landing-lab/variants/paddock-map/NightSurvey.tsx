import { landingLabContent } from '../../landingLabContent'
import { LandingLabActions } from '../../LandingLabPrimitives'
import { PaddockMapStudyFrame } from './PaddockMapStudyFrame'

const surveyPlacements = [
  'lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start',
  'lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-end',
  'lg:col-span-5 lg:col-start-2 lg:row-start-3 lg:self-center',
  'lg:col-span-5 lg:col-start-8 lg:row-start-3 lg:self-end',
] as const

export function NightSurvey({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <PaddockMapStudyFrame theme={theme} className="paddock-night-field">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 1800"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M26 98H438V34H938V218H1414V688H1218V1048H1364V1516H910V1768H316V1590H26V1116H194V646H26Z"
          fill="none"
          stroke="var(--paddock-night-rail)"
          strokeOpacity="0.54"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M438 34V646H1040V218M194 646H26M620 646V1590M1218 688H620M194 1116H1218M910 1048V1768M316 1590V1116"
          fill="none"
          stroke="var(--paddock-night-rail)"
          strokeOpacity="0.24"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M70 420H1410M70 918H1410M70 1410H1410M344 58V1740M788 58V1740M1188 58V1740"
          fill="none"
          stroke="var(--paddock-night-rail)"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="2 12"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M82 1542C240 1398 202 1084 404 964C592 852 556 444 792 360C1016 280 982 724 1198 790C1356 838 1266 1190 1068 1278C886 1358 748 1498 628 1732"
          fill="none"
          stroke="var(--paddock-night-route)"
          strokeOpacity="0.24"
          strokeWidth="13"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          pathLength="1"
          className="paddock-night-route"
          d="M82 1542C240 1398 202 1084 404 964C592 852 556 444 792 360C1016 280 982 724 1198 790C1356 838 1266 1190 1068 1278C886 1358 748 1498 628 1732"
          fill="none"
          stroke="var(--paddock-night-route)"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <section
        aria-labelledby="paddock-night-heading"
        className="relative z-10 grid gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:grid-rows-[minmax(calc(100svh-12rem),auto)_34rem_38rem] lg:gap-x-10 lg:gap-y-16 lg:px-10 lg:py-16 xl:px-14"
      >
        <div className="lg:col-span-7 lg:col-start-2 lg:row-start-1 lg:self-center lg:text-center">
          <h1
            id="paddock-night-heading"
            className="mx-auto max-w-[12ch] font-display text-6xl leading-[0.84] font-black tracking-[-0.035em] text-balance uppercase sm:text-7xl lg:text-[clamp(5rem,6.7vw,6rem)]"
          >
            {landingLabContent.promise}
          </h1>
        </div>

        <div className="max-w-xl lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:self-end lg:text-left">
          <p className="text-base leading-7 font-semibold opacity-80 sm:text-lg sm:leading-8">
            {landingLabContent.audience}
          </p>
          <LandingLabActions className="mt-8" inverse={theme === 'dark'} />
        </div>

        {landingLabContent.capabilities.map((capability, index) => (
          <article
            key={capability.id}
            className={`${surveyPlacements[index]} border-t border-current/30 py-8 lg:py-10`}
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
