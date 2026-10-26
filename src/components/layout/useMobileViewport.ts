import { useEffect } from 'react'
import { useSmallScreen } from '#/lib/useSmallScreen'

export function keyboardViewportInset(
  layoutHeight: number,
  height: number,
  top: number,
  scale: number,
) {
  // Zoom/panning is not an on-screen keyboard. Do not move controls during zoom.
  if (Math.abs(scale - 1) > 0.05) return 0
  const inset = Math.max(0, layoutHeight - height - top)
  return inset > 120 ? inset : 0
}

/** Follows the real visual viewport; no fixed keyboard-height assumptions. */
export function useMobileViewport() {
  const small = useSmallScreen()
  useEffect(() => {
    if (!small) return
    const root = document.documentElement
    const viewport = window.visualViewport
    let frame = 0
    let restingHeight = viewport?.height ?? window.innerHeight
    const update = () => {
      frame = 0
      const active = document.activeElement
      const editing =
        active instanceof HTMLElement &&
        active.matches(
          'textarea, input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), [contenteditable=true]',
        )
      const height = viewport?.height ?? window.innerHeight
      const top = viewport?.offsetTop ?? 0
      const scale = viewport?.scale ?? 1
      if (Math.abs(scale - 1) < 0.05) {
        root.style.setProperty('--mobile-viewport-height', `${height}px`)
        root.style.setProperty('--mobile-viewport-top', `${top}px`)
      }
      if (!editing) restingHeight = Math.max(restingHeight, height)
      const inset = editing
        ? keyboardViewportInset(window.innerHeight, height, top, scale)
        : 0
      const open =
        editing &&
        Math.abs(scale - 1) < 0.05 &&
        (inset > 0 || restingHeight - height > 120)
      root.style.setProperty('--mobile-keyboard-inset', `${inset}px`)
      root.toggleAttribute('data-mobile-keyboard', open)
      if (!open || !(active instanceof HTMLElement)) return
      const rect = active.getBoundingClientRect()
      const dialogBody = active.closest<HTMLElement>(
        '[data-slot=record-dialog-body]',
      )
      // Safari already reveals focused fields in the document. Scrolling the
      // page again on visualViewport events fights its keyboard pan and can
      // trigger another viewport event. Only contained dialogs need our help.
      if (!dialogBody) return
      const bodyRect = dialogBody.getBoundingClientRect()
      const actions = dialogBody.querySelector<HTMLElement>(
        '[data-slot=form-submit-actions]',
      )
      const bottom =
        Math.min(bodyRect.bottom, top + height) -
        (actions?.getBoundingClientRect().height ?? 16) -
        16
      const visibleTop = Math.max(top, bodyRect.top) + 12
      const scrollContainer = dialogBody
      // A tall textarea cannot fit wholly in the remaining viewport. Align its
      // top once instead of oscillating between its two edges on scroll events.
      if (rect.height > bottom - visibleTop) {
        if (Math.abs(rect.top - visibleTop) > 1)
          scrollContainer.scrollBy({
            top: rect.top - visibleTop,
            behavior: 'instant',
          })
      } else if (rect.bottom > bottom)
        scrollContainer.scrollBy({
          top: rect.bottom - bottom,
          behavior: 'instant',
        })
      else if (rect.top < visibleTop)
        scrollContainer.scrollBy({
          top: rect.top - visibleTop,
          behavior: 'instant',
        })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const orientation = () => {
      restingHeight = viewport?.height ?? window.innerHeight
      schedule()
    }
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', orientation)
    document.addEventListener('focusin', schedule)
    document.addEventListener('focusout', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', orientation)
      document.removeEventListener('focusin', schedule)
      document.removeEventListener('focusout', schedule)
      root.style.removeProperty('--mobile-keyboard-inset')
      root.style.removeProperty('--mobile-viewport-height')
      root.style.removeProperty('--mobile-viewport-top')
      root.removeAttribute('data-mobile-keyboard')
    }
  }, [small])
}
