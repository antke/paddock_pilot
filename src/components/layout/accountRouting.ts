function isPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function isInvitationPath(pathname: string) {
  return ['/invitations', '/horse-invitations'].some((base) =>
    isPath(pathname, base),
  )
}

export function isInvitationExemptPath(pathname: string) {
  return (
    isInvitationPath(pathname) ||
    ['/pricing', '/sign-in', '/sign-up'].some((base) => isPath(pathname, base))
  )
}

export function isStableSetupExemptPath(pathname: string) {
  return (
    isInvitationExemptPath(pathname) ||
    ['/onboarding', '/profile', '/stables/create'].some((base) =>
      isPath(pathname, base),
    )
  )
}

/** Only resume an application destination; never another login/setup loop. */
export function onboardingReturnTo(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\s]/.test(value)
  )
    return undefined
  const url = new URL(value, 'https://paddock.invalid')
  if (
    url.origin !== 'https://paddock.invalid' ||
    !['/horses', '/events', '/stables', '/profile'].some((base) =>
      isPath(url.pathname, base),
    )
  )
    return undefined
  return `${url.pathname}${url.search}${url.hash}`
}

export function getOnboardingRedirect({
  pathname,
  href,
  profileComplete,
  stableCount,
  nextStableId,
}: {
  pathname: string
  href: string
  profileComplete: boolean
  stableCount: number
  nextStableId?: string
}): { stableId?: string; returnTo?: string } | undefined {
  pathname = pathname.replace(/\/+$/, '') || '/'
  if (isStableSetupExemptPath(pathname)) return undefined
  // A personal account is ready after saving its profile, even with no stable
  // and no horses yet. Stable membership is not an account-completion signal.
  if (stableCount === 0 && !profileComplete)
    return {
      returnTo: ['/', '/horses', '/stables'].includes(pathname)
        ? undefined
        : onboardingReturnTo(href),
    }
  // Resume stable setup at entry, or in that stable. Do not intercept personal
  // horse work or a deliberate visit to a different, already configured stable.
  if (
    nextStableId &&
    (pathname === '/' ||
      pathname === '/stables' ||
      isPath(pathname, `/stables/${nextStableId}`))
  )
    return { stableId: nextStableId }
  return undefined
}
