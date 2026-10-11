import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../../../convex/_generated/api'
import schema from '../../../convex/schema'
import {
  createHorseAnalysisData,
  createStableHorseOverview,
} from './analysisHorseData'
import type {
  DashboardLabData,
  DashboardLabHorse,
} from '../dashboard-lab/dashboardLabTypes'
import type { LabAnalysis } from './analysisCentreData'

const modules = import.meta.glob('../../../convex/**/*.ts')
describe('complete stable and horse evidence', () => {
  it('includes horses beyond top lists, separates present care, and scopes completed outcomes and coverage to history', async () => {
    const t = convexTest(schema, modules)
    const fixture = await t.run(async (ctx) => {
      const userId = await ctx.db.insert('users', {
        clerkId: 'complete-owner',
        email: 'complete@example.com',
        firstName: 'Owner',
        createdAt: 1,
        updatedAt: 1,
      })
      await ctx.db.insert('userSubscriptions', {
        userId,
        plan: 'personal_pro',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId: userId,
        name: 'Complete yard',
        location: 'Sample',
      })
      const horseIds = []
      for (let i = 0; i < 11; i++) {
        const horseId = await ctx.db.insert('horses', {
          ownerId: userId,
          stableId,
          name: `Horse ${i}`,
          age: 9,
        })
        horseIds.push(horseId)
        if (i === 10) continue
        await ctx.db.insert('horseHealthIssues', {
          horseId,
          stableId,
          title: 'Open record',
          status: 'active',
          severity: 'high',
          notedAt: Date.UTC(2026, 8, 1),
          createdAt: 1,
          updatedAt: 1,
          createdBy: userId,
        })
        for (const [weight, day] of [
          [500, 1],
          [505, 20],
        ]) {
          await ctx.db.insert('horseWeightRecords', {
            horseId,
            stableId,
            weight,
            unit: 'kg',
            measuredAt: Date.UTC(2026, 8, day),
            createdAt: i,
            createdBy: userId,
          })
        }
      }
      const horseId = horseIds[9]
      await ctx.db.insert('horseWeightRecords', {
        horseId,
        stableId,
        weight: 495 / 0.45359237,
        unit: 'lb',
        measuredAt: Date.UTC(2026, 7, 31),
        createdAt: 1,
        createdBy: userId,
      })
      const eventId = await ctx.db.insert('events', {
        stableId,
        createdBy: userId,
        horseIds: [horseId],
        type: 'training',
        title: 'Scheduled complete without outcome',
        date: '2026-09-15',
        time: '10:00',
        status: 'completed',
      })
      for (const [date, status, durationMinutes] of [
        ['2026-08-01', 'completed', 90],
        ['2026-09-01', 'completed', 45],
        ['2026-09-02', 'completed', undefined],
        ['2026-09-03', 'cancelled', 60],
        ['2026-09-04', 'skipped', 60],
        ['2026-09-05', 'planned', 60],
      ] as const) {
        await ctx.db.insert('trainingRecords', {
          stableId,
          horseId,
          eventId,
          date,
          status,
          details: {
            activities: ['flatwork'],
            format: 'regular',
            durationMinutes,
          },
          recordedBy: userId,
          createdAt: 1,
          updatedAt: 1,
        })
      }
      await ctx.db.insert('careReminders', {
        stableId,
        horseId,
        title: 'Overdue today, outside history',
        category: 'other',
        status: 'pending',
        dueDate: '2026-10-01',
        priority: 'medium',
        createdBy: userId,
        createdAt: 1,
        updatedAt: 1,
      })
      return { stableId, horseId, horseIds }
    })
    const result = await t
      .withIdentity({
        subject: 'complete-owner',
        email: 'complete@example.com',
      })
      .query(api.stableAnalysis.getForStable, {
        stableId: fixture.stableId,
        today: '2026-10-02',
        timezoneOffsetMinutes: 0,
      })
    if (!result.hasAccess) throw new Error('Missing fixture access')
    expect(result.horseSummaries).toHaveLength(11)
    expect(result.weightTrends).toHaveLength(10)
    expect(result.healthIssueFrequency).toHaveLength(10)
    expect(
      result.horseSummaries.find((row) => row.horseId === fixture.horseId),
    ).toMatchObject({
      activeIssueCount: 1,
      highIssueCount: 1,
      overdueReminderCount: 1,
      latestWeight: {
        latestWeight: 505,
        previousWeight: 500,
        previousMeasuredAt: Date.UTC(2026, 8, 1),
      },
    })
    const horses = fixture.horseIds.map(
      (_id, i) => ({ _id, name: `Horse ${i}` }) as DashboardLabHorse,
    )
    const overview = createStableHorseOverview({
      horses,
      stableAnalysis: result,
      timelineSignals: result.timelineSignals,
      range: { start: '2026-09-01', end: '2026-09-30' },
    })
    const row = overview.find((horse) => horse.horseId === fixture.horseId)!
    expect(row.training).toMatchObject({
      completedCount: 2,
      withDurationCount: 1,
      missingDurationCount: 1,
      recordedMinutes: 45,
    })
    expect(row.training.recordIds).toHaveLength(2)
    expect(row.currentCare?.overdueReminderCount).toBe(1)
    const deepDive = createHorseAnalysisData({
      horse: horses[9],
      data: {
        stable: result.stable,
        events: [],
        dueReminders: [],
      } as unknown as DashboardLabData,
      analysis: { horsesNeedingAttention: [] } as unknown as LabAnalysis,
      stableAnalysis: result,
      timelineSignals: result.timelineSignals,
    })
    expect(deepDive.summaryComplete).toBe(true)
    expect(deepDive.summary.activeIssueCount).toBe(1)
    expect(deepDive.summary.overdueReminderCount).toBe(1)
    expect(deepDive.dueReminders).toHaveLength(1)
    expect(deepDive.dueReminders[0].title).toBe(
      'Overdue today, outside history',
    )
    expect(row.periodWeight).toMatchObject({
      firstDate: '2026-09-01',
      lastDate: '2026-09-20',
      change: 5,
    })
    expect(row.periodWeight?.recordIds).toHaveLength(2)
    const mixedUnitRange = { start: '2026-08-31', end: '2026-09-30' }
    const mixedUnitRow = createStableHorseOverview({
      horses,
      stableAnalysis: result,
      timelineSignals: result.timelineSignals,
      range: mixedUnitRange,
    }).find((horse) => horse.horseId === fixture.horseId)!
    const comparison = await t
      .withIdentity({
        subject: 'complete-owner',
        email: 'complete@example.com',
      })
      .query(api.stableAnalysis.getHorseComparisons, {
        horseId: fixture.horseId,
        ...mixedUnitRange,
        timeZone: 'UTC',
      })
    const weights = comparison.records.filter(
      (record) => record.kind === 'weight',
    )
    expect(mixedUnitRow.periodWeight).toMatchObject({
      firstDate: '2026-08-31',
      lastDate: '2026-09-20',
      unit: 'kg',
    })
    expect(mixedUnitRow.periodWeight?.firstWeight).toBeCloseTo(495)
    expect(mixedUnitRow.periodWeight?.change).toBeCloseTo(10)
    expect(mixedUnitRow.periodWeight?.change).toBeCloseTo(
      weights.at(-1)!.value! - weights[0].value!,
    )
    expect(mixedUnitRow.periodWeight?.recordIds).toHaveLength(3)
    const empty = overview.at(-1)!
    expect(empty.latestWeight).toBeNull()
    expect(empty.periodWeight).toBeNull()
    expect(empty.training.recordedMinutes).toBeNull()
    expect(
      createStableHorseOverview({
        horses,
        stableAnalysis: null,
        timelineSignals: [],
        range: { start: '2026-09-01', end: '2026-09-30' },
      })[0],
    ).toMatchObject({ summaryComplete: false, currentCare: null })
  })
})
