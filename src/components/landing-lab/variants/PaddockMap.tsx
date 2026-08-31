import type { LandingLabVariantProps } from '../LandingLabPrimitives'
import { PaddockMapDispatcher } from './paddock-map/PaddockMapDispatcher'

export default function PaddockMap({
  theme = 'light',
  versionId,
}: LandingLabVariantProps) {
  return <PaddockMapDispatcher theme={theme} versionId={versionId} />
}
