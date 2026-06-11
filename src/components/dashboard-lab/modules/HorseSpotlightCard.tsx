import { Badge } from '#/components/ui/badge'
import { Link } from '@tanstack/react-router'
import type { DashboardLabData } from '../dashboardLabTypes'

export function HorseSpotlightCard({ data }: { data: DashboardLabData }) {
  const horse = data.attentionHorses[0]

  return (
    <section className="rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Horse spotlight</h2>
        <p className="text-sm text-muted-foreground">A single animal anchor for the stable</p>
      </div>
      {horse ? (
        <Link
          to="/stables/$stableId/horses/$horseId"
          params={{ stableId: horse.stableId, horseId: horse.horseId }}
          className="group/horse grid gap-4 rounded-row border border-primary/15 bg-primary/8 p-4 transition-colors hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight underline-offset-4 group-hover/horse:underline">
                {horse.horseName}
              </p>
              <p className="text-sm text-muted-foreground">Needs the most attention today</p>
            </div>
            {horse.highIssueCount > 0 && <Badge variant="destructive">High</Badge>}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <SpotlightNumber label="Issues" value={horse.activeIssueCount} />
            <SpotlightNumber label="Overdue" value={horse.overdueReminderCount} />
            <SpotlightNumber label="Medication" value={horse.activeMedicationCount} />
          </div>
        </Link>
      ) : (
        <p className="rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
          No horse needs extra attention right now.
        </p>
      )}
    </section>
  )
}

function SpotlightNumber({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-card/80 p-3 shadow-control">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
