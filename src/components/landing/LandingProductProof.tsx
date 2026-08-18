import { landingProductShots } from './landingContent'
import { LandingMediaFigure } from './LandingPrimitives'

function ProductCaption({
  caption,
  title,
}: {
  caption: string
  title: string
}) {
  return (
    <>
      <strong className="text-foreground">{title}</strong>
      <span aria-hidden="true"> — </span>
      {caption}
    </>
  )
}

export function LandingProductProof() {
  const { commandCenter, horseRecord, providerVisit } = landingProductShots

  return (
    <div className="grid gap-6">
      <LandingMediaFigure
        {...commandCenter}
        caption={
          <ProductCaption
            title={commandCenter.title}
            caption={commandCenter.caption}
          />
        }
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-reduce:animate-none"
        imageClassName="aspect-[8/5] object-left-top"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <LandingMediaFigure
          {...horseRecord}
          caption={
            <ProductCaption
              title={horseRecord.title}
              caption={horseRecord.caption}
            />
          }
          imageClassName="aspect-[16/8] object-left-top"
        />
        <LandingMediaFigure
          {...providerVisit}
          caption={
            <ProductCaption
              title={providerVisit.title}
              caption={providerVisit.caption}
            />
          }
          imageClassName="aspect-[16/8] object-left-top"
        />
      </div>
    </div>
  )
}
