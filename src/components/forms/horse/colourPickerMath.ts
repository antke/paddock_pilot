export type HsvColour = { h: number; s: number; v: number }

export function hsvToHex({ h, s, v }: HsvColour): `#${string}` {
  const chroma = (v / 100) * (s / 100)
  const segment = (((h % 360) + 360) % 360) / 60
  const x = chroma * (1 - Math.abs((segment % 2) - 1))
  const m = v / 100 - chroma
  const rgb =
    segment < 1
      ? [chroma, x, 0]
      : segment < 2
        ? [x, chroma, 0]
        : segment < 3
          ? [0, chroma, x]
          : segment < 4
            ? [0, x, chroma]
            : segment < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]
  return `#${rgb
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase()}`
}

export function hexToHsv(hex: string, fallbackHue = 0): HsvColour {
  const [r, g, b] = [1, 3, 5].map(
    (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255,
  )
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const h =
    delta === 0
      ? fallbackHue
      : 60 *
        (max === r
          ? ((g - b) / delta + 6) % 6
          : max === g
            ? (b - r) / delta + 2
            : (r - g) / delta + 4)
  return { h, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 }
}
