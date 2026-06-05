import { Badge } from '#/components/ui/badge'
import { landingPreviewEvents } from './landingContent'

export function LandingAppPreview() {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-4 rounded-2xl border bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Misty</p>
            <p className="text-xs text-muted-foreground">Chestnut mare</p>
          </div>
          <Badge variant="secondary">Active issue</Badge>
        </div>

        <div className="grid gap-3 rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nutrition
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Low-sugar chaff</span>
              <span className="text-green-600">Recommended</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Oats</span>
              <span className="text-red-600">Avoid</span>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {landingPreviewEvents.map((event) => (
            <div
              key={event.label}
              className="flex items-center justify-between gap-4 rounded-xl border p-3 text-sm"
            >
              <span className="font-medium">{event.label}</span>
              <span className="text-right text-muted-foreground">
                {event.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
