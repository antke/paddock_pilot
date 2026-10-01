import { describe, expect, it } from 'vitest'
import {
  formatDateKey,
  formatLongDateKey,
  formatMonthYearDateKey,
  formatPartialDateKey,
  formatTime,
} from './dateDisplay'
import { formatCurrencyAmount, formatFileSize } from './numberDisplay'

describe('locale-aware display without changing stored values', () => {
  it('preserves birth-date precision and malformed legacy input', () => {
    expect(formatPartialDateKey('2015', 'pl')).toBe('2015')
    expect(formatPartialDateKey('2015-05', 'pl')).toBe('maj 2015')
    expect(formatPartialDateKey('2015-05-12', 'pl')).toBe('12 maj 2015')
    for (const value of ['unknown', '2015-13', '2015-02-30'])
      expect(formatPartialDateKey(value, 'pl')).toBe(value)
  })
  it('uses Polish date grammar and leaves date keys and clock time intact', () => {
    expect(formatLongDateKey('2026-09-29', 'pl')).toBe('29 września 2026')
    expect(formatMonthYearDateKey('2026-09-29', 'pl')).toBe('wrzesień 2026')
    expect(formatLongDateKey('2026-09-29', 'en')).toBe('29 September 2026')
    expect(formatDateKey(new Date(2026, 8, 29))).toBe('2026-09-29')
    expect(formatTime(new Date(2026, 8, 29, 14, 30), 'pl')).toBe('14:30')
  })
  it('formats Polish decimals while retaining currency and file units', () => {
    expect(formatFileSize(1536, 'pl')).toBe('1,5 KB')
    expect(formatFileSize(1536, 'en')).toBe('1.5 KB')
    expect(formatCurrencyAmount(12345.5, 'pl')).toMatch(/12\s345,50\sGBP/)
    expect(formatCurrencyAmount(1234.5, 'en')).toBe('£1,234.50')
  })
})
