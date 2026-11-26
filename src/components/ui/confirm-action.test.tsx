// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ConfirmActionButton } from './confirm-action'

afterEach(cleanup)

it('says what failed and why, and keeps the dialog open', async () => {
  const onConfirm = vi
    .fn()
    .mockRejectedValue({ data: 'You are not a member of this stable' })
  render(
    <ConfirmActionButton
      label="Leave"
      title="Leave this activity?"
      description="You will no longer see it."
      cancelLabel="Stay"
      failedLabel="Couldn’t leave the activity"
      onConfirm={onConfirm}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Leave' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Leave' }))
  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toBe(
    'Couldn’t leave the activityYou don’t have permission for this anymore. Ask a stable admin if you need it.',
  )
  expect(screen.getByRole('alertdialog')).toBeTruthy()
})
