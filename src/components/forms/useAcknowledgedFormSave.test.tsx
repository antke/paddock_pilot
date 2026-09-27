// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useAcknowledgedFormSave } from './useAcknowledgedFormSave'

afterEach(cleanup)
const messages = { saveError: 'Save failed', continueError: 'Continue failed' }
it('preserves failure classification and permits a later unacknowledged save', async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('private'))
    .mockResolvedValue('record')
  const onSaved = vi.fn()
  const { result } = renderHook(() =>
    useAcknowledgedFormSave({ save, onSaved, ...messages }),
  )
  await act(async () => result.current.submit({ name: 'Draft' }))
  expect(result.current.errorKind).toBe('save')
  expect(result.current.error).toBe('Save failed')
  expect(result.current.acknowledged).toBe(false)
  await act(async () => result.current.submit({ name: 'Draft' }))
  expect(save).toHaveBeenCalledTimes(2)
  expect(onSaved).toHaveBeenCalledWith('record')
  expect(result.current.completed).toBe(true)
  expect(result.current.acknowledged).toBe(true)
})
it('guards same-turn duplicates and retries only continuation after acknowledgement', async () => {
  let release!: (id: string) => void
  const save = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        release = resolve
      }),
  )
  const onSaved = vi
    .fn()
    .mockRejectedValueOnce(new Error('navigation'))
    .mockResolvedValue(undefined)
  const onAcknowledged = vi.fn()
  const onPendingChange = vi.fn()
  const { result } = renderHook(() =>
    useAcknowledgedFormSave({
      save,
      onSaved,
      onAcknowledged,
      onPendingChange,
      ...messages,
    }),
  )
  let first!: Promise<void>
  act(() => {
    first = result.current.submit('Draft')
    void result.current.submit('Duplicate')
  })
  expect(save).toHaveBeenCalledTimes(1)
  await act(async () => {
    release('record')
    await first
  })
  expect(result.current.errorKind).toBe('continuation')
  expect(result.current.acknowledged).toBe(true)
  await act(async () => {
    await result.current.submit('Ignored')
    await result.current.retryContinuation()
  })
  expect(save).toHaveBeenCalledTimes(1)
  expect(onAcknowledged).toHaveBeenCalledExactlyOnceWith('record', 'Draft')
  expect(onSaved).toHaveBeenCalledTimes(2)
  expect(result.current.completed).toBe(true)
  expect(onPendingChange.mock.calls.map(([value]) => value)).toEqual([
    true,
    false,
    true,
    false,
  ])
})
it('retains acknowledgement if its notification throws, then continues without saving again', async () => {
  const save = vi.fn().mockResolvedValue('record')
  const onSaved = vi.fn()
  const onAcknowledged = vi.fn(() => {
    throw new Error('notification failed')
  })
  const { result } = renderHook(() =>
    useAcknowledgedFormSave({ save, onSaved, onAcknowledged, ...messages }),
  )
  await act(async () => result.current.submit('Draft'))
  expect(result.current.errorKind).toBe('continuation')
  expect(result.current.acknowledged).toBe(true)
  expect(onSaved).not.toHaveBeenCalled()
  await act(async () => result.current.retryContinuation())
  expect(save).toHaveBeenCalledTimes(1)
  expect(onAcknowledged).toHaveBeenCalledTimes(1)
  expect(onSaved).toHaveBeenCalledOnce()
})
it('does not acknowledge or navigate when an in-flight save finishes after unmount', async () => {
  let release!: (id: string) => void
  const save = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        release = resolve
      }),
  )
  const onSaved = vi.fn()
  const onAcknowledged = vi.fn()
  const onPendingChange = vi.fn()
  const { result, unmount } = renderHook(() =>
    useAcknowledgedFormSave({
      save,
      onSaved,
      onAcknowledged,
      onPendingChange,
      ...messages,
    }),
  )
  let pending!: Promise<void>
  act(() => {
    pending = result.current.submit('Draft')
  })
  unmount()
  await act(async () => {
    release('record')
    await pending
  })
  expect(onAcknowledged).not.toHaveBeenCalled()
  expect(onSaved).not.toHaveBeenCalled()
  expect(onPendingChange.mock.calls.map(([value]) => value)).toEqual([
    true,
    false,
  ])
})
