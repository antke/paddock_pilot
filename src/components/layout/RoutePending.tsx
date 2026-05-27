import { Spinner } from '#/components/ui/spinner'

export function RoutePending() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner className="size-5" />
    </div>
  )
}
