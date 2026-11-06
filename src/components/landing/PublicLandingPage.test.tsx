// @vitest-environment jsdom
import type * as RouterModule from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PublicLandingPage } from './PublicLandingPage'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props} />
  ),
}))
afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Runs the board's frames by hand, in a 1000px window. */
function stubBoard({ reducedMotion = false } = {}) {
  const frames: Array<FrameRequestCallback> = []
  const scrollBy = vi.fn()
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }))
  vi.stubGlobal('requestAnimationFrame', (next: FrameRequestCallback) => {
    frames.push(next)
    return frames.length
  })
  vi.stubGlobal('scrollBy', scrollBy)
  vi.stubGlobal('scrollTo', vi.fn())
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('lp-wipe') ? 2000 : 1000
    },
  )
  return {
    scrollBy,
    /** Runs the next frame this far into the wipe. */
    frame: (share: number) =>
      frames.shift()?.(performance.now() + share * 2600 + 100),
    /** Puts the top of the 2000px track at a given place on screen. */
    scrollTrack: (container: HTMLElement, top: number) => {
      const track = container.querySelector<HTMLElement>('.lp-wipe')
      const stage = container.querySelector<HTMLElement>('.lp-wipe-stage')
      if (!track || !stage) throw new Error('board track is missing')
      track.getBoundingClientRect = () => ({ top }) as DOMRect
      stage.getBoundingClientRect = () => ({ top: Math.max(0, top) }) as DOMRect
      fireEvent.scroll(window)
      return track
    },
  }
}

const wipeButton = () => screen.getByRole('button', { name: 'Tidy it up' })

function headings(level: number) {
  return screen
    .getAllByRole('heading', { level })
    .map((heading) => heading.textContent)
}

describe('PublicLandingPage', () => {
  it('tells the whiteboard story in order and links to working account routes', () => {
    render(<PublicLandingPage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main').id).toBe('country-main')
    expect(headings(2)).toEqual([
      'Every yard has a board like this.',
      'Paddock Pilot tidies it up.',
      'Share the work. Keep what’s yours.',
      'Fair questions, plain answers.',
      'Wipe the whiteboard clean.',
    ])
    const accountLinks = screen.getAllByRole('link', {
      name: 'Create your account',
    })
    expect(accountLinks).toHaveLength(3)
    for (const link of accountLinks) {
      expect(link.getAttribute('href')).toBe('/sign-up/$')
    }
    for (const link of screen.getAllByRole('link', { name: 'Plans' })) {
      expect(link.getAttribute('href')).toBe('/pricing')
    }
  })

  it('describes the full board to screen readers without reading out its scrawl', () => {
    render(<PublicLandingPage />)
    expect(screen.getByRole('img', { name: /whiteboard crowded/ })).toBeTruthy()
  })

  it('wipes the board from the button and leaves every note as a tidy entry', () => {
    const board = stubBoard()
    const { container } = render(<PublicLandingPage />)
    const track = board.scrollTrack(container, 400)
    const sweep = container.querySelector('[data-sweep]')
    const eraser = container.querySelector('[data-eraser]')
    const wipedArea = () => sweep?.getAttribute('d')?.length ?? 0
    const untouched = wipedArea()
    expect(eraser?.getAttribute('opacity')).toBe('0')

    fireEvent.click(wipeButton())
    board.frame(0.4)
    const partway = wipedArea()
    expect(partway).toBeGreaterThan(untouched)
    expect(eraser?.getAttribute('opacity')).toBe('1')
    expect(track.dataset.board).toBe('wiping')

    const entries = [
      ...container.querySelectorAll<HTMLElement>('[data-tidy-entry]'),
    ]
    const shown = () =>
      entries.map((entry) => entry.style.getPropertyValue('--lp-entry'))
    expect(entries).toHaveLength(5)
    expect(shown()[0]).toBe('1.000')
    expect(shown()[4]).toBe('0.000')

    board.frame(1)
    expect(wipedArea()).toBeGreaterThan(partway)
    expect(track.style.getPropertyValue('--lp-clean')).toBe('1.000')
    expect(shown()).toEqual(entries.map(() => '1.000'))
    expect(track.dataset.board).toBe('tidy')
  })

  it('fades a rubbed board over instead of sweeping it from the start', () => {
    const board = stubBoard()
    vi.stubGlobal(
      'DOMPoint',
      class {
        constructor(
          public x: number,
          public y: number,
        ) {}
        matrixTransform() {
          return this
        }
      },
    )
    const { container } = render(<PublicLandingPage />)
    const track = board.scrollTrack(container, 400)
    const art = container.querySelector<SVGSVGElement>('.lp-board-art-wide')
    if (!art) throw new Error('board art is missing')
    art.getBoundingClientRect = () => ({ width: 1600 }) as DOMRect
    art.getScreenCTM = () => ({ inverse: () => ({}) }) as DOMMatrix

    const surface = container.querySelector('.lp-board') as HTMLElement
    const rub = (clientX: number) =>
      surface.dispatchEvent(
        Object.assign(new MouseEvent('pointermove', { clientX, clientY: 90 }), {
          pointerType: 'mouse',
        }),
      )
    rub(100)
    rub(1500)
    const sweep = art.querySelector('[data-sweep]')
    const rubbed = sweep?.getAttribute('d')
    expect(rubbed).toBe('M100 90 L1500 90 ')
    expect(track.dataset.board).toBe('messy')

    for (const x of [100, 1500, 100, 1500]) rub(x)
    expect(track.dataset.board).toBe('wiping')
    const finished = sweep?.getAttribute('d')

    const entry = container.querySelector<HTMLElement>('[data-tidy-entry]')
    board.frame(0.3)
    expect(sweep?.getAttribute('d')).toBe(finished)
    expect(entry?.style.getPropertyValue('--lp-entry')).toBe('0.000')

    board.frame(2)
    expect(sweep?.getAttribute('d')).toBe(finished)
    expect(entry?.style.getPropertyValue('--lp-entry')).toBe('1.000')
    expect(track.dataset.board).toBe('tidy')
  })

  it('holds the scroll and wipes the board when the visitor tries to leave it unwiped', () => {
    const board = stubBoard()
    const { container } = render(<PublicLandingPage />)

    const track = board.scrollTrack(container, -650)
    expect(track.dataset.board).toBe('messy')
    expect(board.scrollBy).not.toHaveBeenCalled()

    board.scrollTrack(container, -820)
    expect(track.dataset.board).toBe('wiping')
    expect(board.scrollBy).toHaveBeenLastCalledWith({
      top: -120,
      behavior: 'instant',
    })

    board.frame(0.5)
    board.scrollTrack(container, -760)
    expect(board.scrollBy).toHaveBeenLastCalledWith({
      top: -60,
      behavior: 'instant',
    })

    board.frame(1)
    board.scrollBy.mockClear()
    board.scrollTrack(container, -900)
    expect(track.dataset.board).toBe('tidy')
    expect(board.scrollBy).not.toHaveBeenCalled()
  })

  it('never holds a visitor who arrives past the board', () => {
    const board = stubBoard()
    const { container } = render(<PublicLandingPage />)
    const track = board.scrollTrack(container, -1500)
    expect(board.scrollBy).not.toHaveBeenCalled()
    expect(track.dataset.board).toBe('tidy')
    expect(track.style.getPropertyValue('--lp-clean')).toBe('1.000')
  })

  it('never drives the wipe under reduced motion', () => {
    const board = stubBoard({ reducedMotion: true })
    const { container } = render(<PublicLandingPage />)
    const sweep = container.querySelector('[data-sweep]')
    const untouched = sweep?.getAttribute('d')
    const track = board.scrollTrack(container, -600)
    fireEvent.click(wipeButton())
    board.frame(1)
    expect(sweep?.getAttribute('d')).toBe(untouched)
    expect(track.style.getPropertyValue('--lp-clean')).toBe('')
    expect(board.scrollBy).not.toHaveBeenCalled()
  })

  it('keeps rejected filler and invented commercial proof off the page', () => {
    const { container } = render(<PublicLandingPage />)
    const copy = (container.textContent ?? '').toLowerCase()
    for (const removed of [
      'for small stable owners and members.',
      'one record, there for the next person.',
      'notes after completion',
      'free trial',
      'trusted by',
      'cancel anytime',
      'no payment is required',
    ]) {
      expect(copy).not.toContain(removed)
    }
    for (const screenshot of [
      'stable-command-center',
      'horse-record',
      'provider-visit',
    ]) {
      expect(
        container.querySelector(`img[src="/landing/${screenshot}.png"]`),
      ).toBeNull()
    }
  })
})
