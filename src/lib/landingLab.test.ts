import { describe, expect, it } from 'vitest'
import { isLandingLabPath } from './landingLab'

describe('isLandingLabPath', () => {
  it('matches only the landing lab route family', () => {
    expect(isLandingLabPath('/landing-lab')).toBe(true)
    expect(isLandingLabPath('/landing-lab/shared-field-horizon')).toBe(true)
    expect(isLandingLabPath('/landing-lab/')).toBe(true)
    expect(isLandingLabPath('/landing')).toBe(false)
    expect(isLandingLabPath('/')).toBe(false)
    expect(isLandingLabPath('/page-lab/stable-dashboard')).toBe(false)
  })
})
