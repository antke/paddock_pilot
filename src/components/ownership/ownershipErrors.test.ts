import { expect, it } from 'vitest'
import { ownershipErrorMessage } from './ownershipErrors'

it('maps known recoverable errors without exposing server diagnostics', () => {
  expect(
    ownershipErrorMessage(
      { data: 'Care plans changed. Review departure again.' },
      'en',
    ),
  ).toContain('Check the updated appointments')
  expect(
    ownershipErrorMessage(
      { data: 'Please wait before sending more invitations' },
      'pl',
    ),
  ).toContain('Poczekaj godzinę')
  expect(
    ownershipErrorMessage(
      new Error('Internal error at SECRET_DATABASE_URL'),
      'en',
    ),
  ).not.toContain('SECRET')
})
