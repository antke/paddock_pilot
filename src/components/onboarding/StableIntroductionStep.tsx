import { BuildingsIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import {
  DetailDisplayField,
  DetailGrid,
} from '#/components/dashboard/DetailBlocks'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'

export function StableIntroductionStep({
  stable,
  onContinue,
}: {
  stable: Doc<'stables'>
  onContinue: () => void | Promise<void>
}) {
  return (
    <div className="grid gap-5">
      <Alert className="border-primary/20 bg-primary/5">
        <BuildingsIcon aria-hidden="true" />
        <AlertTitle>You’re connected to {stable.name}</AlertTitle>
        <AlertDescription>
          You can see shared stable information and coordinate events while
          keeping control of your own horses and records.
        </AlertDescription>
      </Alert>

      <DetailGrid>
        <DetailDisplayField framed label="Location" value={stable.location} />
        <DetailDisplayField
          framed
          label="Primary contact"
          value={stable.contactName || 'Not added yet'}
        />
        <DetailDisplayField
          framed
          label="Contact phone"
          value={stable.contactPhone || 'Not added yet'}
        />
        <DetailDisplayField
          framed
          label="Opening hours"
          value={stable.openingHours || 'Not added yet'}
        />
      </DetailGrid>

      {stable.yardRules && (
        <DetailDisplayField
          framed
          label="Yard rules"
          value={stable.yardRules}
        />
      )}

      <DashboardActions align="end">
        <Button type="button" onClick={onContinue}>
          Continue
        </Button>
      </DashboardActions>
    </div>
  )
}
