/** Operational readiness is derived from current records, not wizard completion. */
export type StableSetupStepId =
  'contact' | 'emergency' | 'vet' | 'farrier' | 'horse' | 'team' | 'yard'

export type StableSetupInput = {
  stable: {
    contactPhone?: string
    emergencyPhone?: string
    openingHours?: string
    yardRules?: string
  }
  providers: ReadonlyArray<{ type: string; phone?: string }>
  horseCount: number
  memberCount: number
  invitationCount: number
}

export function getStableSetupSteps(input: StableSetupInput) {
  const hasPhone = (type: string) =>
    input.providers.some(
      (provider) => provider.type === type && provider.phone?.trim(),
    )
  return [
    { id: 'contact', complete: Boolean(input.stable.contactPhone?.trim()) },
    { id: 'emergency', complete: Boolean(input.stable.emergencyPhone?.trim()) },
    { id: 'vet', complete: hasPhone('vet') },
    { id: 'farrier', complete: hasPhone('farrier') },
    { id: 'horse', complete: input.horseCount > 0 },
    {
      id: 'team',
      complete: input.memberCount > 0 || input.invitationCount > 0,
    },
    {
      id: 'yard',
      complete: Boolean(
        input.stable.openingHours?.trim() && input.stable.yardRules?.trim(),
      ),
    },
  ] satisfies Array<{ id: StableSetupStepId; complete: boolean }>
}
