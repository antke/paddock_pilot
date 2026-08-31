import { describe, expect, it } from 'vitest'

import { getCareReminderDueLabel } from './careReminderDisplay'
import {
  getCareReminderDueState,
  getCareReminderRecordAccent,
} from './careReminderState'

const today = '2026-08-21'

describe('care reminder due presentation', () => {
  it.each([
    ['2026-08-20', 'pending', 'overdue'],
    ['2026-08-21', 'pending', 'today'],
    ['2026-08-22', 'pending', 'soon'],
    ['2026-08-28', 'pending', 'soon'],
    ['2026-08-29', 'pending', 'upcoming'],
    ['2026-08-20', 'completed', 'inactive'],
    ['2026-08-20', 'dismissed', 'inactive'],
  ] as const)('classifies %s %s as %s', (dueDate, status, expected) => {
    expect(getCareReminderDueState({ dueDate, status }, today)).toBe(expected)
  })

  it('keeps routine upcoming reminders on the neutral boundary', () => {
    expect(
      getCareReminderRecordAccent(
        { dueDate: '2026-09-12', status: 'pending' },
        today,
      ),
    ).toBe('none')
  })

  it('reserves rails for real urgency and terminal states', () => {
    expect(
      getCareReminderRecordAccent(
        { dueDate: '2026-08-20', status: 'pending' },
        today,
      ),
    ).toBe('danger')
    expect(
      getCareReminderRecordAccent(
        { dueDate: '2026-08-21', status: 'pending' },
        today,
      ),
    ).toBe('warning')
    expect(
      getCareReminderRecordAccent(
        { dueDate: '2026-08-20', status: 'completed' },
        today,
      ),
    ).toBe('primary')
    expect(
      getCareReminderRecordAccent(
        { dueDate: '2026-08-20', status: 'dismissed' },
        today,
      ),
    ).toBe('muted')
  })

  it('uses relative labels only when they reduce date arithmetic', () => {
    expect(
      getCareReminderDueLabel(
        { dueDate: '2026-08-21', status: 'pending' },
        today,
      ),
    ).toBe('Due today')
    expect(
      getCareReminderDueLabel(
        { dueDate: '2026-08-22', status: 'pending' },
        today,
      ),
    ).toContain('Due tomorrow')
    expect(
      getCareReminderDueLabel(
        { dueDate: '2026-08-25', status: 'pending' },
        today,
      ),
    ).toContain('Due in 4 days')
  })
})
