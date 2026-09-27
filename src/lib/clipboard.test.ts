// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from './clipboard'

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)
const originalCopy = Object.getOwnPropertyDescriptor(document, 'execCommand')
afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
  if (originalClipboard)
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
  if (originalCopy) Object.defineProperty(document, 'execCommand', originalCopy)
  else Reflect.deleteProperty(document, 'execCommand')
})
function fallback(execCommand?: () => boolean) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  })
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  })
  vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(
    function (this: HTMLTextAreaElement) {
      this.focus()
    },
  )
  const trigger = document.createElement('button')
  document.body.append(trigger)
  trigger.focus()
  return trigger
}

describe('legacy clipboard cleanup', () => {
  it('removes the temporary textarea and restores prior focus when the copy command throws', async () => {
    const trigger = fallback(() => {
      throw new Error('Copy denied')
    })
    await expect(copyTextToClipboard('Sample URL')).rejects.toThrow(
      'Copy denied',
    )
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it.each([undefined, () => false])(
    'cleans up when the command is absent or declines copying',
    async (command) => {
      const trigger = fallback(command)
      await expect(copyTextToClipboard('Sample URL')).rejects.toThrow(
        'Clipboard is unavailable',
      )
      expect(document.querySelector('textarea')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    },
  )

  it('does not steal focus back when another actor focused a different control', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    fallback(() => {
      outside.focus()
      throw new Error('Copy denied')
    })
    await expect(copyTextToClipboard('Sample URL')).rejects.toThrow(
      'Copy denied',
    )
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('preserves the acknowledged success contract while cleaning up', async () => {
    const trigger = fallback(() => true)
    await expect(copyTextToClipboard('Sample URL')).resolves.toBeUndefined()
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
