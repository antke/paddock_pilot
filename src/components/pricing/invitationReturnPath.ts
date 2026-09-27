/** Pricing only offers a return to a local invitation token route. */
export function getInvitationReturnPath(value: unknown): string | undefined {
  return typeof value === 'string' &&
    /^\/invitations\/[A-Za-z0-9_-]+$/.test(value)
    ? value
    : undefined
}
