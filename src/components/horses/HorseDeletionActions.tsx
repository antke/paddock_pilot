import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'

type HorseDeletionActionsProps = {
  horse: Doc<'horses'>
  onDeleted: () => void
}

export function HorseDeletionActions({
  horse,
  onDeleted,
}: HorseDeletionActionsProps) {
  const softDeleteHorse = useMutation(api.horses.deleteHorse)
  const [isDeleting, setIsDeleting] = useState(false)
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false)

  const runDelete = async () => {
    try {
      setIsDeleting(true)
      await softDeleteHorse({ id: horse._id })
      showAppSuccessToast({
        title: 'Horse moved to deleted horses',
        description: (
          <p>{horse.name} can be restored from stable settings for 14 days.</p>
        ),
      })

      setSoftDeleteOpen(false)
      onDeleted()
    } catch {
      showAppErrorToast()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardSectionCard
      title="Delete horse"
      description="Use the 14-day deleted horses area for recoverable mistakes. Permanent deletion cannot be undone."
      contentGap="compact"
    >
      <DashboardActions align="start">
        <AlertDialog open={softDeleteOpen} onOpenChange={setSoftDeleteOpen}>
          <AlertDialogTrigger
            render={<Button type="button" variant="outline" />}
          >
            Move to deleted horses
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Move {horse.name} to deleted horses?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The horse disappears from daily views but all records remain
                available for restoration for 14 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={runDelete}
              >
                {isDeleting ? 'Moving...' : 'Move horse'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardActions>
    </DashboardSectionCard>
  )
}
