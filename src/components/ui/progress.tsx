import { cn } from '#/lib/utils'

type ProgressProps = {
  value: number
  max?: number
  label?: string
  className?: string
  indicatorClassName?: string
}

export function Progress({
  value,
  max = 100,
  label,
  className,
  indicatorClassName,
}: ProgressProps) {
  const normalizedValue = clamp(value, 0, max)
  const percent = max > 0 ? (normalizedValue / max) * 100 : 0

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={normalizedValue}
      className={cn(
        'h-2 overflow-hidden rounded-control bg-secondary',
        className,
      )}
    >
      <div
        data-slot="progress-indicator"
        className={cn('h-full rounded-control bg-primary', indicatorClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
