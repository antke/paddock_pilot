import { describe, expect, it } from 'vitest'

import { createDashboardLabFixtureData } from './dashboardLabFixtures'

describe('createDashboardLabFixtureData', () => {
  it('keeps fixture records scoped to the selected stable', () => {
    const primary = createDashboardLabFixtureData()
    const annex = createDashboardLabFixtureData(
      'lab-stable-north-pasture' as typeof primary.stable._id,
    )

    expect(primary.stable.name).toBe('Cedar Ridge Barn')
    expect(primary.horses).toHaveLength(3)
    expect(annex.stable.name).toBe('North Pasture Annex')
    expect(annex.horses).toHaveLength(0)
    expect(annex.events).toHaveLength(0)
    expect(annex.dueReminders).toHaveLength(0)
    expect(annex.attentionHorses).toHaveLength(0)
  })
})
