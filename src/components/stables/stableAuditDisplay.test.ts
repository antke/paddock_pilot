import { describe, expect, it } from 'vitest'
import {
  formatAuditAction,
  formatAuditActor,
  formatStableAuditSummary,
} from './stableAuditDisplay'

describe('localized activity log', () => {
  it('formats structured training history without changing the horse name', () => {
    const entry = {
      action: 'training.recorded',
      summary: 'Juniper: completed',
      details: {
        kind: 'training_recorded' as const,
        horseName: 'Łąka',
        status: 'completed' as const,
        date: '2026-09-29',
      },
    }
    expect(formatStableAuditSummary(entry, 'pl')).toBe(
      'Łąka: Ukończono · 29 wrz 2026',
    )
    expect(formatStableAuditSummary(entry, 'en')).toBe(
      'Łąka: Completed · 29 Sept 2026',
    )
  })
  it('translates structured changes independently of the legacy summary', () => {
    const entry = {
      action: 'event.updated',
      summary: 'Event time changed',
      details: {
        kind: 'event_changes' as const,
        changes: ['time', 'location'],
      },
    }
    expect(formatStableAuditSummary(entry, 'pl')).toBe(
      'Zmieniono godzinę wydarzenia, Zmieniono miejsce',
    )
    expect(formatStableAuditSummary(entry, 'en')).toBe(
      'Event time changed, Location changed',
    )
  })
  it('preserves user-written titles and names even when they match a system message', () => {
    expect(
      formatStableAuditSummary(
        { action: 'event.updated', summary: 'Location changed' },
        'pl',
      ),
    ).toBe('Location changed')
    expect(
      formatStableAuditSummary(
        {
          action: 'member.removed',
          details: {
            kind: 'member_removed',
            memberName: 'Żaneta Łącka',
            reassignedHorseCount: 0,
          },
        },
        'pl',
      ),
    ).toBe('Żaneta Łącka')
  })
  it('recognizes unambiguous old generated summaries without requiring details', () => {
    const result = formatStableAuditSummary(
      {
        action: 'member.removed',
        summary: 'Removed member and reassigned 2 horses',
      },
      'pl',
    )
    expect(result).toContain('2')
    expect(result).not.toContain('horses')
    expect(
      formatStableAuditSummary(
        {
          action: 'event.created',
          summary: 'Removed member and reassigned 2 horses',
        },
        'pl',
      ),
    ).toBe('Removed member and reassigned 2 horses')
  })
  it('localizes missing actors and unknown actions instead of leaking identifiers', () => {
    expect(formatAuditActor(null, 'pl')).toBe('Były użytkownik')
    expect(formatAuditAction('new.action', 'pl')).not.toMatch(
      /new.action|Record changed/,
    )
  })
})
