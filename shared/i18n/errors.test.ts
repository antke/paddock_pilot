import { expect, it } from 'vitest'
import { ConvexError } from 'convex/values'
import { userFacingError } from '../../convex/libs/userFacingError'
import { getUserFacingErrorCode, userFacingErrorMessages } from './errors'

it('opts into structured errors while preserving the exact legacy string payload', () => {
  const oldError = userFacingError('futureTraining')
  const newError = userFacingError('futureTraining', 'structured')
  expect(oldError.data).toBe(userFacingErrorMessages.futureTraining)
  expect(newError.data).toEqual({
    code: 'futureTraining',
    message: userFacingErrorMessages.futureTraining,
  })
  expect(getUserFacingErrorCode(oldError)).toBe('futureTraining')
  expect(getUserFacingErrorCode(newError)).toBe('futureTraining')
})
it('does not show unknown server strings or extract guessed codes from technical errors', () => {
  for (const error of [
    new Error('Future sessions cannot be completed'),
    new ConvexError('Private server details'),
    { data: { code: 'toString' } },
    { data: { code: 'unknown', message: 'Private server details' } },
    null,
  ])
    expect(getUserFacingErrorCode(error)).toBeUndefined()
})
