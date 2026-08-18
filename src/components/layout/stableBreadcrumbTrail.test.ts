import { describe, expect, it } from 'vitest'
import { createStableBreadcrumbItems } from './stableBreadcrumbTrail'

describe('createStableBreadcrumbItems', () => {
  it.each([
    ['', ['Overview']],
    ['/horses', ['Horses']],
    ['/horses/create', ['Horses', 'Add horse']],
    ['/horses/deleted', ['Horses', 'Deleted horses']],
    ['/horses/horse-1/profile', ['Horses', 'Mistral']],
    ['/horses/horse-1/activity', ['Horses', 'Mistral', 'Activity']],
    ['/horses/horse-1/care-summary', ['Horses', 'Mistral', 'Care summary']],
    ['/events', ['Events']],
    ['/events/calendar', ['Events', 'Calendar']],
    ['/events/create', ['Events', 'Add event']],
    ['/events/event-1', ['Events', 'Vaccination']],
    ['/events/event-1/edit', ['Events', 'Vaccination', 'Edit event']],
    ['/reminders', ['Care']],
    ['/documents', ['Documents']],
    ['/analysis', ['Analysis']],
    ['/members', ['Stable people']],
    ['/settings', ['Settings']],
    ['/welcome', ['Getting started']],
  ])('creates the expected trail for %s', (path, expectedLabels) => {
    const items = createStableBreadcrumbItems(path, {
      eventTitle: 'Vaccination',
      horseName: 'Mistral',
    })

    expect(items.map((item) => item.label)).toEqual(expectedLabels)
  })
})
