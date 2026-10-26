// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import { ActionFeedback } from './action-feedback'

afterEach(cleanup)

it('exposes only the current action label while reserving space for pending text', () => {
  const view = render(
    <FormSubmitButtons
      isSubmitting={false}
      submitLabel="Save care record"
      submittingLabel="Saving care record…"
    />,
  )
  expect(screen.getByRole('button', { name: 'Save care record' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Saving/ })).toBeNull()
  view.rerender(
    <FormSubmitButtons
      isSubmitting
      submitLabel="Save care record"
      submittingLabel="Saving care record…"
    />,
  )
  const pending = screen.getByRole<HTMLButtonElement>('button', {
    name: 'Saving care record…',
  })
  expect(pending.disabled).toBe(true)
  expect(pending.getAttribute('aria-busy')).toBe('true')
  expect(screen.queryByRole('button', { name: 'Save care record' })).toBeNull()
})

it('pending takes precedence over a prior confirmation', () => {
  render(
    <button>
      <ActionFeedback
        label="Copy link"
        pendingLabel="Copying…"
        confirmedLabel="Copied"
        pending
        confirmed
      />
    </button>,
  )
  expect(screen.getByRole('button', { name: 'Copying…' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull()
})

it('shows a retry after failure without exposing stale success, and returns to pending on retry', () => {
  const ui = (pending: boolean, failed: boolean) => (
    <FormSubmitButtons
      isSubmitting={pending}
      failed={failed}
      confirmed
      confirmedLabel="Saved"
      submitLabel="Save record"
      submittingLabel="Saving record…"
    />
  )
  const view = render(ui(false, true))
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Try again' })
      .disabled,
  ).toBe(false)
  expect(screen.queryByRole('button', { name: 'Saved' })).toBeNull()
  view.rerender(ui(true, true))
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Saving record…' })
      .disabled,
  ).toBe(true)
  expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  view.rerender(ui(false, false))
  expect(screen.getByRole('button', { name: 'Saved' })).toBeTruthy()
})
