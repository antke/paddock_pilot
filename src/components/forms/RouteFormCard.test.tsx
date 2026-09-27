// @vitest-environment jsdom
import { useState } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Input } from '#/components/ui/input'
import { Field, FieldLabel } from '#/components/ui/field'
import { RouteFormActions, RouteFormCard } from './RouteFormCard'
import { FormSection } from './FormLayout'

afterEach(cleanup)

const confirmation = {
  title: 'Discard your changes?',
  description: 'Restore the last saved details.',
  confirmLabel: 'Confirm discard',
}

describe('Route form reset interruption', () => {
  it.each([true, false])(
    'skips collapsed fields after reset (later section open: %s)',
    async (hasOpenSection) => {
      function Sample() {
        const [dirty, setDirty] = useState(true)
        return (
          <RouteFormCard
            formId="sections"
            title="Edit horse"
            onSubmit={(event) => event.preventDefault()}
            actions={
              <RouteFormActions
                disabled={!dirty}
                isSubmitting={false}
                onReset={() => setDirty(false)}
                resetConfirmation={confirmation}
                submitLabel="Save"
                submittingLabel="Saving…"
              />
            }
          >
            <FormSection title="Identification" number={1}>
              <Field>
                <FieldLabel htmlFor="passport">Passport number</FieldLabel>
                <Input id="passport" />
              </Field>
            </FormSection>
            <div hidden>
              <Input aria-label="Hidden field" />
            </div>
            <div aria-hidden="true">
              <Input aria-label="Presentation field" />
            </div>
            {hasOpenSection && (
              <FormSection title="Care" number={2} defaultOpen>
                <Field>
                  <FieldLabel htmlFor="care-notes">Care notes</FieldLabel>
                  <Input id="care-notes" />
                </Field>
              </FormSection>
            )}
          </RouteFormCard>
        )
      }
      render(<Sample />)
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
      fireEvent.click(
        await screen.findByRole('button', { name: 'Confirm discard' }),
      )
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
      const expected = hasOpenSection
        ? screen.getByLabelText('Care notes')
        : screen.getByRole('button', { name: /Identification/ })
      await waitFor(() => expect(document.activeElement).toBe(expected))
      expect(
        document.activeElement?.closest(
          '[inert], [hidden], [aria-hidden="true"]',
        ),
      ).toBeNull()
    },
  )

  it.each([true, false])(
    'closes confirmation after reset (persistent configuration: %s), without submitting, and recovers focus when reset becomes disabled',
    async (persistent) => {
      const reset = vi.fn()
      const submit = vi.fn((event) => event.preventDefault())
      function Sample() {
        const [dirty, setDirty] = useState(true)
        return (
          <RouteFormCard
            formId="stable"
            title="Edit stable"
            onSubmit={submit}
            actions={
              <RouteFormActions
                isSubmitting={false}
                disabled={!dirty}
                onReset={() => {
                  reset()
                  setDirty(false)
                }}
                resetConfirmation={
                  persistent || dirty ? confirmation : undefined
                }
                submitLabel="Save stable"
                submittingLabel="Saving…"
              />
            }
          >
            <Field>
              <FieldLabel htmlFor="stable-name">Stable name</FieldLabel>
              <Input id="stable-name" defaultValue="Stajnia Łąka" />
            </Field>
          </RouteFormCard>
        )
      }
      render(<Sample />)
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
      fireEvent.click(
        await screen.findByRole('button', { name: 'Confirm discard' }),
      )
      expect(reset).toHaveBeenCalledTimes(1)
      expect(submit).not.toHaveBeenCalled()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByLabelText('Stable name'),
        ),
      )
    },
  )

  it.each(['pending', 'disabled'] as const)(
    'blocks confirmation if the form becomes %s while the dialog is open, while keeping cancellation available',
    async (reason) => {
      const reset = vi.fn()
      const view = (blocked: boolean) => (
        <RouteFormActions
          isSubmitting={reason === 'pending' && blocked}
          disabled={reason === 'disabled' && blocked}
          onReset={reset}
          resetConfirmation={confirmation}
          submitLabel="Save"
          submittingLabel="Saving…"
        />
      )
      const { rerender } = render(view(false))
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await screen.findByRole('alertdialog')
      rerender(view(true))
      const confirm = screen.getByRole('button', { name: 'Confirm discard' })
      fireEvent.click(confirm)
      expect(reset).not.toHaveBeenCalled()
      expect(confirm).toHaveProperty('disabled', true)
      fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    },
  )
})
