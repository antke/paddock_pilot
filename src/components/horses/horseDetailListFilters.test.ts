import { describe, expect, it } from 'vitest'

import { filterListItems } from '#/components/list-filtering/listFiltering'
import type { Doc, Id } from 'convex/_generated/dataModel'

import {
  createHorseActivityListFilterConfig,
  createHorseHealthIssueListFilterConfig,
  createHorseMedicationRecordListFilterConfig,
  createHorseNutritionLogListFilterConfig,
  createHorseWeightRecordListFilterConfig,
} from './horseDetailListFilters'

const stableId = 'stable-1' as Id<'stables'>
const horseId = 'horse-1' as Id<'horses'>
const userId = 'user-1' as Id<'users'>

describe('horse detail list filters', () => {
  it('filters activity by type and searches event details', () => {
    const config = createHorseActivityListFilterConfig()
    const events = [
      createEvent({ title: 'Dental appointment', type: 'dentist' }),
      createEvent({ title: 'Flatwork session', location: 'Indoor arena' }),
    ]

    expect(
      filterListItems({
        items: events,
        config,
        state: { query: 'arena', facets: {} },
      }).map((event) => event.title),
    ).toEqual(['Flatwork session'])
    expect(
      filterListItems({
        items: events,
        config,
        state: { query: '', facets: { type: 'dentist' } },
      }).map((event) => event.title),
    ).toEqual(['Dental appointment'])
  })

  it('filters health issues by state and severity', () => {
    const config = createHorseHealthIssueListFilterConfig()
    const issues = [
      createHealthIssue({ title: 'Resolved scrape', status: 'resolved' }),
      createHealthIssue({ title: 'Active lameness', severity: 'high' }),
    ]

    expect(
      filterListItems({
        items: issues,
        config,
        state: { query: '', facets: { status: 'resolved' } },
      }).map((issue) => issue.title),
    ).toEqual(['Resolved scrape'])
    expect(
      filterListItems({
        items: issues,
        config,
        state: { query: '', facets: { severity: 'high' } },
      }).map((issue) => issue.title),
    ).toEqual(['Active lameness'])
  })

  it('filters medication records by status and searches provider notes', () => {
    const config = createHorseMedicationRecordListFilterConfig()
    const records = [
      createMedicationRecord({ medicationName: 'Bute', prescribedBy: 'Dr Vale' }),
      createMedicationRecord({ medicationName: 'Antibiotic', status: 'completed' }),
    ]

    expect(
      filterListItems({
        items: records,
        config,
        state: { query: 'vale', facets: {} },
      }).map((record) => record.medicationName),
    ).toEqual(['Bute'])
    expect(
      filterListItems({
        items: records,
        config,
        state: { query: '', facets: { status: 'completed' } },
      }).map((record) => record.medicationName),
    ).toEqual(['Antibiotic'])
  })

  it('searches nutrition log snapshots', () => {
    const config = createHorseNutritionLogListFilterConfig()
    const logs = [
      createNutritionLog({ summary: 'Routine update', recommendedSnapshot: ['Oil'] }),
      createNutritionLog({ summary: 'Pasture note', avoidSnapshot: ['Molasses'] }),
    ]

    expect(
      filterListItems({
        items: logs,
        config,
        state: { query: 'molasses', facets: {} },
      }).map((log) => log.summary),
    ).toEqual(['Pasture note'])
  })

  it('filters weight records by unit and body condition presence', () => {
    const config = createHorseWeightRecordListFilterConfig()
    const records = [
      createWeightRecord({ weight: 520, unit: 'kg', bodyConditionScore: 5 }),
      createWeightRecord({ weight: 1120, unit: 'lb', bodyConditionScore: undefined }),
    ]

    expect(
      filterListItems({
        items: records,
        config,
        state: { query: '', facets: { unit: 'kg' } },
      }).map((record) => record.weight),
    ).toEqual([520])
    expect(
      filterListItems({
        items: records,
        config,
        state: { query: '', facets: { bodyCondition: 'without-body-condition' } },
      }).map((record) => record.weight),
    ).toEqual([1120])
  })
})

function createEvent(overrides: Partial<Doc<'events'>>): Doc<'events'> {
  return {
    _id: 'event-1' as Id<'events'>,
    _creationTime: 1,
    horseIds: [horseId],
    createdBy: userId,
    stableId,
    type: 'training',
    title: 'Training session',
    date: '2026-06-01',
    time: '09:00',
    status: 'planned',
    ...overrides,
  }
}

function createHealthIssue(
  overrides: Partial<Doc<'horseHealthIssues'>>,
): Doc<'horseHealthIssues'> {
  return {
    _id: 'health-issue-1' as Id<'horseHealthIssues'>,
    _creationTime: 1,
    horseId,
    stableId,
    title: 'Health issue',
    status: 'active',
    notedAt: 1,
    createdBy: userId,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function createMedicationRecord(
  overrides: Partial<Doc<'horseMedicationRecords'>>,
): Doc<'horseMedicationRecords'> {
  return {
    _id: 'medication-1' as Id<'horseMedicationRecords'>,
    _creationTime: 1,
    horseId,
    stableId,
    medicationName: 'Medication',
    dosage: '1 scoop',
    startDate: '2026-06-01',
    status: 'active',
    createdBy: userId,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function createNutritionLog(
  overrides: Partial<Doc<'horseNutritionLogs'>>,
): Doc<'horseNutritionLogs'> {
  return {
    _id: 'nutrition-log-1' as Id<'horseNutritionLogs'>,
    _creationTime: 1,
    horseId,
    stableId,
    changedAt: 1,
    summary: 'Nutrition log',
    createdBy: userId,
    createdAt: 1,
    ...overrides,
  }
}

function createWeightRecord(
  overrides: Partial<Doc<'horseWeightRecords'>>,
): Doc<'horseWeightRecords'> {
  return {
    _id: 'weight-record-1' as Id<'horseWeightRecords'>,
    _creationTime: 1,
    horseId,
    stableId,
    weight: 500,
    unit: 'kg',
    measuredAt: 1,
    createdBy: userId,
    createdAt: 1,
    ...overrides,
  }
}
