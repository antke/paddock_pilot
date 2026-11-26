// Why an action failed and what to do next. Shown under a title that says what failed.
export const actionErrors = {
  offline: 'You’re offline, so nothing changed. Reconnect and try again.',
  signedOut: 'Your session ended. Sign in again, then try once more.',
  noAccess:
    'You don’t have permission for this anymore. Ask a stable admin if you need it.',
  stale:
    'Someone changed or removed this in the meantime. Reload the page to see the latest.',
  invalid: 'Some details weren’t accepted. Check them and try again.',
  blocked:
    'This isn’t allowed here, so nothing changed. Ask a stable admin if it looks wrong.',
  unknown:
    'Something went wrong on our side and nothing changed. Try again in a moment.',
  offlineNoticeTitle: 'You’re offline',
  offlineNoticeText: 'Changes will save when you reconnect.',
} as const
