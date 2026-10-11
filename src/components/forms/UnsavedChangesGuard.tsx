import { useEffect, useRef } from 'react'
import { useBlocker, useRouter } from '@tanstack/react-router'
import { useT } from '#/i18n/LocaleProvider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

/** Reads the latest save acknowledgement synchronously, including before a redirect. */
export function UnsavedChangesGuard({
  shouldBlock,
}: {
  shouldBlock: () => boolean
}) {
  const router = useRouter({ warn: false })
  const check = useRef(shouldBlock)
  check.current = shouldBlock
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!check.current()) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [])

  return router ? <NavigationGuard shouldBlock={() => check.current()} /> : null
}

function NavigationGuard({ shouldBlock }: { shouldBlock: () => boolean }) {
  const t = useT()
  const blocker = useBlocker({
    shouldBlockFn: shouldBlock,
    enableBeforeUnload: false,
    withResolver: true,
  })
  return (
    <AlertDialog
      open={blocker.status === 'blocked'}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.unsavedTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('common.unsavedHelp')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>
            {t('common.keepEditing')}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => blocker.proceed?.()}
          >
            {t('common.leaveWithoutSaving')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
