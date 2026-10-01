import { useEffect } from 'react'
import { useAuth } from '@clerk/tanstack-react-start'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useLocale } from './LocaleProvider'

export function AccountLocaleBridge() {
  const { userId } = useAuth()
  const { isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : 'skip')
  const save = useMutation(api.users.setLocale)
  const { syncAccount } = useLocale()
  useEffect(() => {
    syncAccount(
      userId
        ? {
            id: userId,
            locale: user?.clerkId === userId ? user.locale : undefined,
            save: (locale) => save({ locale }),
          }
        : null,
    )
  }, [userId, user?.clerkId, user?.locale, save, syncAccount])
  return null
}
