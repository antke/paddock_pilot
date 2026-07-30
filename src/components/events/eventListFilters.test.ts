import { filterListItems } from '#/components/list-filtering/listFiltering'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { describe, expect, it } from 'vitest'
import { createEventListFilterConfig } from './eventListFilters'

const stableId = 'stable-1' as Id<'stables'>
const userId = 'user-1' as Id<'users'>

describe('event list filters', () => {
  it('searches titles, providers, locations, and labels', () => {
    const config = createEventListFilterConfig()
    const events = [
      createEvent({
        title: 'Spring vaccinations',
        type: 'vet',
        providerName: 'Dr Lewis',
      }),
      createEvent({
        title: 'Arena session',
        type: 'training',
        location: 'North arena',
      }),
    ]

    expect(searchEventTitles(events, config, 'lewis')).toEqual([
      'Spring vaccinations',
    ])
    expect(searchEventTitles(events, config, 'north arena')).toEqual([
      'Arena session',
    ])
    expect(searchEventTitles(events, config, 'vet')).toEqual([
      'Spring vaccinations',
    ])
  })

  it('filters by type and treats a missing status as planned', () => {
    const config = createEventListFilterConfig()
    const events = [
      createEvent({ title: 'Vaccination', type: 'vet' }),
      createEvent({
        title: 'Completed session',
        type: 'training',
        status: 'completed',
      }),
    ]

    expect(
      filterListItems({
        items: events,
        config,
        state: { query: '', facets: { type: 'training' } },
      }).map((event) => event.title),
    ).toEqual(['Completed session'])
    expect(
      filterListItems({
        items: events,
        config,
        state: { query: '', facets: { status: 'planned' } },
      }).map((event) => event.title),
    ).toEqual(['Vaccination'])
  })
})

function searchEventTitles(
  events: Array<Doc<'events'>>,
  config: ReturnType<typeof createEventListFilterConfig>,
  query: string,
) {
  return filterListItems({
    items: events,
    config,
    state: { query, facets: {} },
  }).map((event) => event.title)
}

function createEvent(overrides: Partial<Doc<'events'>>): Doc<'events'> {
  return {
    _id: 'event-1' as Id<'events'>,
    _creationTime: 1,
    stableId,
    createdBy: userId,
    horseIds: [],
    type: 'other',
    title: 'Event',
    date: '2026-07-15',
    time: '09:00',
    ...overrides,
  }
}
