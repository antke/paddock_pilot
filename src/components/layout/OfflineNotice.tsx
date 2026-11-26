import { useEffect } from 'react'
import { useConvexConnectionState } from 'convex/react'
import { useT } from '#/i18n/LocaleProvider'
import { dismissAppToast, showAppWarningToast } from '#/components/ui/sonner'

const toastId = 'offline-notice'
// Short reconnects (tab wake, network switch) shouldn't flash a notice.
const graceMs = 3000

/** Convex holds changes while disconnected, so saves spin instead of failing; this says why. */
export function OfflineNotice() {
  const { hasEverConnected, isWebSocketConnected } = useConvexConnectionState()
  const t = useT()
  const offline = hasEverConnected && !isWebSocketConnected

  useEffect(() => {
    if (!offline) {
      dismissAppToast(toastId)
      return
    }
    const timer = setTimeout(
      () =>
        showAppWarningToast({
          id: toastId,
          title: t('actionErrors.offlineNoticeTitle'),
          description: t('actionErrors.offlineNoticeText'),
          duration: Infinity,
        }),
      graceMs,
    )
    return () => clearTimeout(timer)
  }, [offline, t])

  return null
}
