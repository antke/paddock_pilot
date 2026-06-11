import { Badge } from '#/components/ui/badge'
import type { DashboardLabData } from '../dashboardLabTypes'

export function CareMatrixCard({ data }: { data: DashboardLabData }) {
  const horses = data.attentionHorses.slice(0, 6)

  return (
    <section className="rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Horse care matrix</h2>
        <p className="text-sm text-muted-foreground">Horses against care signals</p>
      </div>
      {horses.length === 0 ? (
        <p className="rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
          No active horse care signals for this stable.
        </p>
      ) : (
        <div className="overflow-hidden rounded-row border border-border-subtle text-sm">
          <div className="grid grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(4rem,0.45fr))] bg-muted/55 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="p-3">Horse</div>
            <div className="p-3 text-center">Issues</div>
            <div className="p-3 text-center">Overdue</div>
            <div className="p-3 text-center">Meds</div>
          </div>
          {horses.map((horse) => (
            <div
              key={horse.horseId}
              className="grid grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(4rem,0.45fr))] border-t border-border-subtle"
            >
              <div className="p-3 font-medium">{horse.horseName}</div>
              <MatrixCell value={horse.activeIssueCount} urgent={horse.highIssueCount > 0} />
              <MatrixCell value={horse.overdueReminderCount} urgent={horse.overdueReminderCount > 0} />
              <MatrixCell value={horse.activeMedicationCount} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function MatrixCell({ value, urgent = false }: { value: number; urgent?: boolean }) {
  return (
    <div className="grid place-items-center p-3">
      <Badge variant={urgent ? 'destructive' : 'outline'}>{value}</Badge>
    </div>
  )
}
