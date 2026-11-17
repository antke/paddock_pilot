// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import {
  useClaimNavigationSection,
  useClaimedNavigationSection,
} from './navigationSection'

it('holds a claimed section only while the claiming page is mounted', () => {
  const menu = renderHook(() => useClaimedNavigationSection())
  expect(menu.result.current).toBeUndefined()
  const page = renderHook<void, { section?: 'training' }>(
    ({ section }) => useClaimNavigationSection(section),
    { initialProps: {} },
  )
  expect(menu.result.current).toBeUndefined()
  // The section is known once the event loads.
  page.rerender({ section: 'training' })
  expect(menu.result.current).toBe('training')
  page.unmount()
  expect(menu.result.current).toBeUndefined()
})
