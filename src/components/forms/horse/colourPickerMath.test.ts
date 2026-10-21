import { expect, it } from 'vitest'
import { hexToHsv, hsvToHex } from './colourPickerMath'

it('preserves RGB colours through picker conversion, including grayscale and hue boundaries', () => {
  for (const colour of [
    '#000000',
    '#FFFFFF',
    '#808080',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#347653',
    '#A23BC4',
    '#01FDFE',
  ]) {
    expect(hsvToHex(hexToHsv(colour))).toBe(colour)
  }
  expect(hsvToHex({ h: 360, s: 100, v: 100 })).toBe('#FF0000')
  expect(hexToHsv('#000000', 213).h).toBe(213)
})
