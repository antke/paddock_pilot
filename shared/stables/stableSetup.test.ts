import { describe, expect, it } from 'vitest'
import { getStableSetupSteps } from './stableSetup'

describe('operational setup readiness', () => {
  it('does not mistake one field or an unrelated provider for completed contacts', () => {
    const steps = getStableSetupSteps({
      stable: { openingHours: '9–5' },
      providers: [
        { type: 'trainer', phone: '123' },
        { type: 'vet', phone: ' ' },
      ],
      horseCount: 0,
      memberCount: 0,
      invitationCount: 0,
    })
    expect(steps.every((step) => !step.complete)).toBe(true)
  })

  it('tracks each current record independently, including deferred team invitation', () => {
    const steps = getStableSetupSteps({
      stable: {
        contactPhone: '123',
        emergencyPhone: '456',
        openingHours: '9–5',
        yardRules: 'Close gates',
      },
      providers: [
        { type: 'vet', phone: '789' },
        { type: 'farrier', phone: '012' },
      ],
      horseCount: 1,
      memberCount: 0,
      invitationCount: 1,
    })
    expect(steps).toHaveLength(7)
    expect(steps.every((step) => step.complete)).toBe(true)
  })
})
