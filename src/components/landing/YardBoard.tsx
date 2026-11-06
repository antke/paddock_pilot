import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'

/*
 * The page's one big moment: a real yard whiteboard, written by several hands.
 * The visitor wipes it with the button or with the mouse, and if they do neither
 * it wipes itself as they try to scroll past. A clean run is a timed sweep, each
 * pass leaving the same notes behind it as tidy entries; a board someone has
 * already rubbed fades over instead of starting again. With reduced motion none
 * of this runs: the board shows full, then tidy.
 */

type Point = [x: number, y: number]
type Hand = 'a' | 'b'
type Ink = 'blue' | 'red' | 'black' | 'green'
type Note = {
  text: string
  x: number
  y: number
  size: number
  rotate: number
  hand: Hand
  ink: Ink
}
type BoardLayout = {
  width: number
  height: number
  eraserWidth: number
  sweep: ReadonlyArray<Point>
}

/** A hand never sweeps in a ruled line, so the wiped edge wanders a little. */
function wobble(points: ReadonlyArray<Point>, amount: number) {
  const steps = 28
  const wandering: Array<Point> = [points[0]]
  points.slice(1).forEach(([x1, y1], segment) => {
    const [x0, y0] = points[segment]
    for (let step = 1; step <= steps; step += 1) {
      const share = step / steps
      const sway =
        Math.sin(step * 0.61 + segment) + Math.sin(step * 0.23 + segment * 2)
      wandering.push([
        x0 + (x1 - x0) * share,
        y0 + (y1 - y0) * share + sway * amount,
      ])
    }
  })
  return wandering
}

const WIDE: BoardLayout = {
  width: 1600,
  height: 800,
  eraserWidth: 200,
  sweep: wobble(
    [
      [-140, 70],
      [1740, 96],
      [1740, 214],
      [-140, 240],
      [-140, 356],
      [1740, 384],
      [1740, 500],
      [-140, 526],
      [-140, 640],
      [1740, 668],
      [1740, 790],
      [-140, 816],
    ],
    3.5,
  ),
}

const TALL: BoardLayout = {
  width: 360,
  height: 640,
  eraserWidth: 140,
  sweep: wobble(
    [
      [-100, 56],
      [460, 74],
      [460, 170],
      [-100, 188],
      [-100, 286],
      [460, 304],
      [460, 400],
      [-100, 418],
      [-100, 514],
      [460, 532],
      [460, 620],
      [-100, 640],
    ],
    2.5,
  ),
}

const WIPE_MS = 2600
const FADE_MS = 2400
const WIPE_END = 0.8
const CLEAN_START = 0.72
/** Where the sweep sits as it reaches the first and last entries. */
const FIRST_ENTRY = 0.1
const LAST_ENTRY = 0.84
const ENTRY_REVEAL = 0.12
/** Roughly how much of the board the mouse rubs before the eraser takes over. */
const RUB_SHARE = 0.7
/** How many screens of scrolling a visitor gets at the pinned board before the hold. */
const HOLD_AFTER = 0.7

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function pathOf(points: ReadonlyArray<Point>) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ')
}

function lengthOf(points: ReadonlyArray<Point>) {
  let total = 0
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1]
    const [x1, y1] = points[index]
    total += Math.hypot(x1 - x0, y1 - y0)
  }
  return total
}

function pointAlong(points: ReadonlyArray<Point>, distance: number): Point {
  let remaining = distance
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1]
    const [x1, y1] = points[index]
    const segment = Math.hypot(x1 - x0, y1 - y0)
    if (remaining <= segment) {
      const share = segment === 0 ? 0 : remaining / segment
      return [x0 + (x1 - x0) * share, y0 + (y1 - y0) * share]
    }
    remaining -= segment
  }
  return points[points.length - 1]
}

/*
 * Grows the sweep point by point. Safari paints a dashed stroke inside a mask
 * as if it were solid, so the wiped area can't be drawn with a dash offset.
 */
function pathUpTo(points: ReadonlyArray<Point>, distance: number) {
  const walked: Array<Point> = [points[0]]
  let remaining = distance
  for (let index = 1; index < points.length && remaining > 0; index += 1) {
    const [x0, y0] = points[index - 1]
    const [x1, y1] = points[index]
    const segment = Math.hypot(x1 - x0, y1 - y0)
    const share = segment === 0 ? 1 : Math.min(1, remaining / segment)
    walked.push([x0 + (x1 - x0) * share, y0 + (y1 - y0) * share])
    remaining -= segment
  }
  return pathOf(walked)
}

function NoteText({ text, x, y, size, rotate, hand, ink }: Note) {
  return (
    <text
      className={`lp-hand-${hand} lp-ink-${ink}`}
      transform={`rotate(${rotate} ${x} ${y})`}
      x={x}
      y={y}
      fontSize={size}
    >
      {text.split('\n').map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : size * 1.08}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function BoardArt({
  layout,
  variant,
  children,
}: {
  layout: BoardLayout
  variant: 'wide' | 'tall'
  children: ReactNode
}) {
  const baseId = useId()
  const wipedId = `${baseId}-wiped`
  const area = {
    x: -200,
    y: -100,
    width: layout.width + 400,
    height: layout.height + 200,
  }
  const stroke = {
    d: pathUpTo(layout.sweep, 0),
    fill: 'none',
    strokeLinejoin: 'round' as const,
  }
  const long = layout.eraserWidth * 1.14
  const short = long * 0.46
  const felt = short * 0.13

  return (
    <svg
      className={`lp-board-art lp-board-art-${variant}`}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      aria-hidden="true"
      focusable="false"
      data-variant={variant}
    >
      <mask id={wipedId} maskUnits="userSpaceOnUse" {...area}>
        <rect {...area} fill="#fff" />
        {/* A half-wiped fringe, so the eraser's edge drags instead of slicing. */}
        <path
          data-sweep
          {...stroke}
          stroke="#7a7a7a"
          strokeWidth={layout.eraserWidth * 1.14}
        />
        <path
          data-sweep
          {...stroke}
          stroke="#000"
          strokeWidth={layout.eraserWidth * 0.94}
        />
      </mask>
      <g className="lp-writing" mask={`url(#${wipedId})`}>
        {children}
      </g>
      <g data-eraser opacity={0}>
        <rect
          x={-short / 2}
          y={-long / 2}
          width={short + felt}
          height={long}
          className="lp-eraser-felt"
        />
        <rect
          x={-short / 2}
          y={-long / 2}
          width={short}
          height={long}
          className="lp-eraser-block"
        />
      </g>
    </svg>
  )
}

function useBoardWipe() {
  const trackRef = useRef<HTMLElement>(null)
  const wipeRef = useRef(() => {})

  useEffect(() => {
    const track = trackRef.current
    const stage = track?.querySelector<HTMLElement>('.lp-wipe-stage')
    const board = track?.querySelector<HTMLElement>('.lp-board')
    if (
      !track ||
      !stage ||
      !board ||
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const rigs = [
      { layout: WIDE, variant: 'wide' },
      { layout: TALL, variant: 'tall' },
    ].flatMap(({ layout, variant }) => {
      const svg = track.querySelector<SVGSVGElement>(
        `svg[data-variant="${variant}"]`,
      )
      const sweeps = svg?.querySelectorAll('[data-sweep]')
      const eraser = svg?.querySelector('[data-eraser]')
      if (!svg || !sweeps || !eraser) return []
      return [
        {
          layout,
          svg,
          sweeps,
          eraser,
          trail: '',
          rubbed: 0,
          last: null as Point | null,
        },
      ]
    })
    type Rig = (typeof rigs)[number]

    const entries = [...track.querySelectorAll('[data-tidy-entry]')]
    const entryStep = (LAST_ENTRY - FIRST_ENTRY) / (entries.length - 1)

    const moveEraser = (rig: Rig, [x, y]: Point, turn: number) => {
      rig.eraser.setAttribute(
        'transform',
        `translate(${x} ${y}) rotate(${Math.sin(turn) * 3})`,
      )
    }

    const paint = (progress: number) => {
      const wipe = clamp01(progress / WIPE_END)
      const clean = clamp01((progress - CLEAN_START) / (1 - CLEAN_START))

      track.style.setProperty('--lp-clean', clean.toFixed(3))
      // Keeps the tidy board's link out of the tab order until it can be seen.
      track.style.setProperty(
        '--lp-clean-view',
        clean > 0 ? 'visible' : 'hidden',
      )
      entries.forEach((entry, index) => {
        const reached = FIRST_ENTRY + entryStep * index
        const shown = clamp01((wipe - reached) / ENTRY_REVEAL)
        ;(entry as HTMLElement).style.setProperty(
          '--lp-entry',
          shown.toFixed(3),
        )
      })
      for (const rig of rigs) {
        const { sweep: route } = rig.layout
        const length = lengthOf(route) * wipe
        const wiped = `${rig.trail}${pathUpTo(route, length)}`
        for (const sweep of rig.sweeps) sweep.setAttribute('d', wiped)
        moveEraser(rig, pointAlong(route, length), wipe * 34)
        rig.eraser.setAttribute('opacity', wipe > 0 && wipe < 1 ? '1' : '0')
      }
    }

    /* The notes and heading go in the first half, the tidy board comes in the second. */
    const paintFade = (progress: number) => {
      track.style.setProperty('--lp-clean', progress.toFixed(3))
      track.style.setProperty('--lp-clean-view', 'visible')
      const shown = clamp01(progress * 2 - 1).toFixed(3)
      for (const entry of entries) {
        ;(entry as HTMLElement).style.setProperty('--lp-entry', shown)
      }
      for (const rig of rigs) {
        rig.eraser.setAttribute('opacity', `${clamp01(1 - progress * 2)}`)
      }
    }

    let frame = 0
    let state: 'messy' | 'wiping' | 'tidy' = 'messy'
    const settle = () => {
      state = 'tidy'
      // The scroll room goes once it is no longer needed, so hold the view still.
      const top =
        window.scrollY +
        track.getBoundingClientRect().top -
        stage.getBoundingClientRect().top
      track.dataset.board = state
      window.scrollTo({ top, behavior: 'instant' })
    }
    const wipe = () => {
      if (state !== 'messy') return
      state = 'wiping'
      track.dataset.board = state
      const rubbed = rigs.some((rig) => rig.trail)
      const draw = rubbed ? paintFade : paint
      const duration = rubbed ? FADE_MS : WIPE_MS
      const started = performance.now()
      const step = (now: number) => {
        const progress = clamp01((now - started) / duration)
        draw(progress)
        if (progress < 1) frame = window.requestAnimationFrame(step)
        else settle()
      }
      frame = window.requestAnimationFrame(step)
    }
    wipeRef.current = wipe

    /*
     * A board nobody has wiped wipes itself as the visitor tries to leave it. The
     * stage is pinned here, so holding the scroll doesn't show on screen, and
     * the room left in the track soaks up a flick or a Space press.
     */
    const holdScroll = () => {
      if (state === 'tidy') return
      const { top } = track.getBoundingClientRect()
      const scrolled = -top
      const holdAt = stage.offsetHeight * HOLD_AFTER
      if (scrolled < holdAt) return
      if (scrolled > track.offsetHeight - stage.offsetHeight) {
        // Arrived past the board, from a restored position or the End key.
        if (state === 'wiping') return
        paint(1)
        settle()
        return
      }
      wipe()
      window.scrollBy({ top: holdAt - scrolled, behavior: 'instant' })
    }

    const rub = (event: PointerEvent) => {
      if (state !== 'messy' || event.pointerType !== 'mouse') return
      const rig = rigs.find(({ svg }) => svg.getBoundingClientRect().width > 0)
      const toBoard = rig?.svg.getScreenCTM()?.inverse()
      if (!rig || !toBoard) return
      const { x, y } = new DOMPoint(
        event.clientX,
        event.clientY,
      ).matrixTransform(toBoard)
      const here: Point = [Math.round(x), Math.round(y)]
      rig.trail += `${rig.last ? 'L' : 'M'}${here[0]} ${here[1]} `
      if (rig.last) rig.rubbed += lengthOf([rig.last, here])
      rig.last = here
      for (const sweep of rig.sweeps) sweep.setAttribute('d', rig.trail)
      moveEraser(rig, here, rig.rubbed * 0.01)
      rig.eraser.setAttribute('opacity', '1')
      const { width, height, eraserWidth } = rig.layout
      if (rig.rubbed * eraserWidth > width * height * RUB_SHARE) wipe()
    }
    const stopRubbing = () => {
      if (state !== 'messy') return
      for (const rig of rigs) {
        rig.last = null
        rig.eraser.setAttribute('opacity', '0')
      }
    }

    paint(0)
    holdScroll()
    window.addEventListener('scroll', holdScroll, { passive: true })
    board.addEventListener('pointermove', rub)
    board.addEventListener('pointerleave', stopRubbing)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', holdScroll)
      board.removeEventListener('pointermove', rub)
      board.removeEventListener('pointerleave', stopRubbing)
    }
  }, [])

  return { trackRef, wipeRef }
}

export function YardBoard({ action }: { action: ReactNode }) {
  const t = useT()
  const id = useId()
  const { trackRef, wipeRef } = useBoardWipe()

  const days = t('publicLanding.board.days').split(' ')
  const rotaSlots = ['P', 'K', 'A', 'P', '?', 'K', '??']
  const note = {
    rota: t('publicLanding.board.rota'),
    farrier: t('publicLanding.board.farrier'),
    both: t('publicLanding.board.both'),
    doNotWipe: t('publicLanding.board.doNotWipe'),
    turnout: t('publicLanding.board.turnout'),
    feed: t('publicLanding.board.feed'),
    wormer: t('publicLanding.board.wormer'),
    health: t('publicLanding.board.health'),
    jab: t('publicLanding.board.jab'),
    vet: t('publicLanding.board.vet'),
    hay: t('publicLanding.board.hay'),
    ghostOne: t('publicLanding.board.ghostOne'),
    ghostTwo: t('publicLanding.board.ghostTwo'),
  }

  const entries = [
    {
      title: t('publicLanding.tidy.farrierTitle'),
      detail: t('publicLanding.tidy.farrierDetail'),
    },
    {
      title: t('publicLanding.tidy.turnoutTitle'),
      detail: t('publicLanding.tidy.turnoutDetail'),
    },
    {
      title: t('publicLanding.tidy.wormerTitle'),
      detail: t('publicLanding.tidy.wormerDetail'),
    },
    {
      title: t('publicLanding.tidy.boosterTitle'),
      detail: t('publicLanding.tidy.boosterDetail'),
    },
    {
      title: t('publicLanding.tidy.feedTitle'),
      detail: t('publicLanding.tidy.feedDetail'),
    },
  ]

  return (
    <section
      ref={trackRef}
      className="lp-wipe"
      data-board="messy"
      aria-labelledby={`${id}-mess ${id}-clean`}
    >
      <div className="lp-wipe-stage">
        <div className="country-container lp-wipe-head">
          <h2 id={`${id}-mess`} className="lp-h2">
            {t('publicLanding.boardTitle')}
          </h2>
          <Button
            variant="ghost"
            className="country-button lp-wipe-button"
            onClick={() => wipeRef.current()}
          >
            {t('publicLanding.tidyBoard')}
          </Button>
        </div>
        <div className="lp-board">
          <div
            className="lp-board-mess"
            role="img"
            aria-label={t('publicLanding.board.alt')}
          >
            <BoardArt layout={WIDE} variant="wide">
              <g className="lp-ghost">
                <NoteText
                  text={note.ghostOne}
                  x={860}
                  y={300}
                  size={50}
                  rotate={-3}
                  hand="a"
                  ink="black"
                />
                <NoteText
                  text={note.ghostTwo}
                  x={140}
                  y={730}
                  size={46}
                  rotate={2}
                  hand="b"
                  ink="black"
                />
              </g>

              <NoteText
                text={note.rota}
                x={72}
                y={72}
                size={44}
                rotate={-1}
                hand="b"
                ink="black"
              />
              <g className="lp-pen lp-stroke-black">
                <path d="M62 112c170-7 360 8 566-4" />
                <path d="M60 176c190 6 370-5 572 3" />
                <path d="M64 244c180-6 372 7 562-1" />
                {days.slice(0, 6).map((_, index) => (
                  <path
                    key={index}
                    d={`M${146 + index * 80} ${106 + (index % 2) * 4}c${index % 2 ? 3 : -4} 46 ${index % 2 ? -5 : 4} 94 ${index % 2 ? 1 : -2} 142`}
                  />
                ))}
              </g>
              {days.map((day, index) => (
                <NoteText
                  key={day}
                  text={day}
                  x={74 + index * 80}
                  y={156}
                  size={32}
                  rotate={0}
                  hand="a"
                  ink="black"
                />
              ))}
              {rotaSlots.map((slot, index) => (
                <NoteText
                  key={index}
                  text={slot}
                  x={96 + index * 80}
                  y={222}
                  size={42}
                  rotate={index % 2 ? 3 : -4}
                  hand="a"
                  ink={slot.includes('?') ? 'red' : 'blue'}
                />
              ))}
              <g className="lp-pen lp-stroke-red">
                <path d="M254 222c22-14 36-16 58-30" />
              </g>

              <NoteText
                text={note.farrier}
                x={668}
                y={108}
                size={52}
                rotate={-2}
                hand="a"
                ink="blue"
              />
              <NoteText
                text={note.both}
                x={1000}
                y={196}
                size={46}
                rotate={-4}
                hand="a"
                ink="red"
              />
              <g className="lp-pen lp-stroke-red">
                <path d="M992 170c-30 40 16 58 82 54 72-6 88-46 40-62-48-14-104-10-130 18" />
              </g>

              <g transform="rotate(2.5 1380 96)">
                <NoteText
                  text={note.doNotWipe}
                  x={1236}
                  y={110}
                  size={34}
                  rotate={0}
                  hand="b"
                  ink="red"
                />
                <g className="lp-pen lp-stroke-red lp-pen-heavy">
                  <path d="M1216 62c112-7 232-5 328 2 3 22 6 46 2 68-112 6-232 6-332 0-2-24-3-48 2-70z" />
                  <path d="M1210 146c116 8 232 6 344 0" />
                </g>
              </g>

              <NoteText
                text={note.turnout}
                x={76}
                y={356}
                size={46}
                rotate={1.5}
                hand="b"
                ink="green"
              />
              <NoteText
                text={note.feed}
                x={590}
                y={372}
                size={44}
                rotate={-1.5}
                hand="a"
                ink="black"
              />
              <g className="lp-pen lp-stroke-black">
                <path d="M596 428c120 6 250-8 430 0" />
              </g>
              <NoteText
                text={note.wormer}
                x={1090}
                y={362}
                size={50}
                rotate={-3}
                hand="a"
                ink="red"
              />
              <g className="lp-pen lp-stroke-red">
                <path d="M1096 380c110-16 230-16 400-24M1104 394c120-14 240-14 372-20" />
              </g>
              <NoteText
                text={note.health}
                x={1120}
                y={492}
                size={52}
                rotate={2}
                hand="b"
                ink="blue"
              />
              <NoteText
                text={note.jab}
                x={76}
                y={576}
                size={54}
                rotate={-2}
                hand="a"
                ink="blue"
              />
              <NoteText
                text={note.vet}
                x={610}
                y={586}
                size={54}
                rotate={2.5}
                hand="b"
                ink="green"
              />
              <NoteText
                text={note.hay}
                x={1120}
                y={664}
                size={44}
                rotate={-2}
                hand="b"
                ink="black"
              />
              <g className="lp-pen lp-stroke-blue">
                <path d="M584 268c-30 34-60 40-112 44" />
                <path d="M498 290l-28 22 32 16" />
              </g>
              <g className="lp-pen lp-stroke-green">
                <path d="M1018 574c22-20 46-30 74-32" />
                <path d="M1068 520l26 22-22 24" />
              </g>
            </BoardArt>

            <BoardArt layout={TALL} variant="tall">
              <NoteText
                text={note.farrier}
                x={18}
                y={46}
                size={35}
                rotate={-2}
                hand="a"
                ink="blue"
              />
              <NoteText
                text={note.both}
                x={232}
                y={92}
                size={30}
                rotate={-4}
                hand="a"
                ink="red"
              />
              <g className="lp-pen lp-stroke-red">
                <path d="M226 72c-18 24 8 36 50 33 46-4 58-30 28-41-30-9-66-6-82 12" />
              </g>
              <g transform="rotate(2 180 140)">
                <NoteText
                  text={note.doNotWipe}
                  x={32}
                  y={154}
                  size={27}
                  rotate={0}
                  hand="b"
                  ink="red"
                />
                <g className="lp-pen lp-stroke-red lp-pen-heavy">
                  <path d="M18 122c88-5 180-4 256 1 2 16 4 32 1 48-84 4-176 4-256 0-2-16-3-34-1-49z" />
                </g>
              </g>
              <NoteText
                text={note.turnout}
                x={20}
                y={222}
                size={32}
                rotate={1.5}
                hand="b"
                ink="green"
              />
              <NoteText
                text={note.feed}
                x={18}
                y={318}
                size={31}
                rotate={-1.5}
                hand="a"
                ink="black"
              />
              <g className="lp-pen lp-stroke-black">
                <path d="M22 356c90 4 170-6 282 0" />
              </g>
              <NoteText
                text={note.wormer}
                x={24}
                y={416}
                size={35}
                rotate={-3}
                hand="a"
                ink="red"
              />
              <NoteText
                text={note.vet}
                x={22}
                y={480}
                size={30}
                rotate={2}
                hand="b"
                ink="blue"
              />
              <NoteText
                text={note.hay}
                x={22}
                y={566}
                size={28}
                rotate={-2}
                hand="b"
                ink="black"
              />
            </BoardArt>
          </div>

          <div className="lp-board-clean">
            <h2 id={`${id}-clean`} className="lp-h2 lp-tidy-title">
              {t('publicLanding.keepsTitle')}
            </h2>
            <ol className="lp-tidy">
              {entries.map((entry) => (
                <li key={entry.title} data-tidy-entry>
                  <span className="lp-tidy-entry-title">{entry.title}</span>
                  <span className="lp-tidy-entry-detail">{entry.detail}</span>
                </li>
              ))}
            </ol>
            <div className="lp-tidy-foot">
              <p className="lp-lede">{t('publicLanding.keepsCopy')}</p>
              {action}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
