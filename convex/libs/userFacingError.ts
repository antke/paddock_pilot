import { ConvexError } from 'convex/values'
import { userFacingErrorMessages } from '../../shared/i18n/errors'
import type { UserFacingErrorCode } from '../../shared/i18n/errors'

/** Opt-in structured errors keep the exact string contract for older clients. */
export function userFacingError(
  code: UserFacingErrorCode,
  format?: 'structured',
) {
  const message = userFacingErrorMessages[code]
  return new ConvexError(format === 'structured' ? { code, message } : message)
}
