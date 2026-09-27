// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DashboardMetaList } from './DashboardMetaList'

afterEach(cleanup)

it('separates present metadata without orphan separators for empty optional strings', () => {
  const frequency = ''
  const prescriber = ''
  const { container } = render(
    <DashboardMetaList separator="dot">
      <span>As prescribed</span>
      {frequency && <span>{frequency}</span>}
      <span>Started today</span>
      {prescriber && <span>{prescriber}</span>}
    </DashboardMetaList>,
  )
  expect(container.textContent).toBe('As prescribed·Started today')
  expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
})

it('keeps zero values while omitting whitespace and absent metadata', () => {
  const { container } = render(
    <DashboardMetaList separator="slash">
      {null}
      {'  '}
      {0}
      {false}
      <span>Open</span>
    </DashboardMetaList>,
  )
  expect(container.textContent).toBe('0/Open')
})
