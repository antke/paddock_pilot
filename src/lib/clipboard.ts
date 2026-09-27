export async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const previousFocus = document.activeElement
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    const copied =
      typeof document.execCommand === 'function' && document.execCommand('copy')
    if (!copied) throw new Error('Clipboard is unavailable')
  } finally {
    const restoreFocus = document.activeElement === textarea
    textarea.remove()
    if (
      restoreFocus &&
      previousFocus instanceof HTMLElement &&
      previousFocus.isConnected
    ) {
      previousFocus.focus({ preventScroll: true })
    }
  }
}
