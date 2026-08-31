import type { ComponentType } from 'react'

import { LayeredFields } from './LayeredFields'
import { MovingGates } from './MovingGates'
import { NightSurvey } from './NightSurvey'
import { resolvePaddockMapVersionId } from './paddockMapVersions'
import type { PaddockMapVersionId } from './paddockMapVersions'

type PaddockMapStudyProps = {
  theme: 'light' | 'dark'
}

const paddockMapStudies: Record<
  PaddockMapVersionId,
  ComponentType<PaddockMapStudyProps>
> = {
  'layered-fields': LayeredFields,
  'moving-gates': MovingGates,
  'night-survey': NightSurvey,
}

export function PaddockMapDispatcher({
  theme,
  versionId,
}: {
  theme: 'light' | 'dark'
  versionId?: string
}) {
  const Study = paddockMapStudies[resolvePaddockMapVersionId(versionId)]
  return <Study theme={theme} />
}
