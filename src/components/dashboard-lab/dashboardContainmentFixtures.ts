import type { Id } from 'convex/_generated/dataModel'
import { createDashboardLabFixtureData } from './dashboardLabFixtures'
import type { DashboardLabData } from './dashboardLabTypes'

/** A deliberately busy, fictional yard to expose the screenshot's density problem. */
export function createDashboardContainmentFixture(): DashboardLabData {
  const base = createDashboardLabFixtureData()
  const names = ['Juniper', 'Atlas', 'Meadow', 'Clover', 'Willow', 'Bracken']
  const horses = names.map((name, index) => ({
    ...base.horses[index % base.horses.length],
    _id: `lab-containment-horse-${index}` as Id<'horses'>,
    name,
  }))
  const attentionHorses = horses.map((horse, index) => ({
    ...base.attentionHorses[0],
    horseId: horse._id,
    horseName: horse.name,
    ownerName: horse.ownerName,
    breed: horse.breed,
    highIssueCount: index === 0 ? 2 : 1,
    activeIssueCount: index === 0 ? 2 : 1,
  }))
  const reminders = [
    ['Recheck lameness notes after turnout', 'vet'],
    ['Review the medication course with the vet', 'medication'],
    ['Arrange a worm count', 'deworming'],
    ['Monthly weight and body condition check', 'weight'],
    ['Book a dental follow-up', 'dentist'],
    ['Order senior supplement refill', 'nutrition'],
    ['Confirm the next farrier visit', 'farrier'],
    ['Update the vaccination record', 'vet'],
    ['Check the winter feeding plan', 'nutrition'],
    ['Restock yard first-aid supplies', 'admin'],
    ['Share the latest visit notes', 'admin'],
  ] as const
  const dueReminders = reminders.map(([title, category], index) => ({
    ...base.dueReminders[index % base.dueReminders.length],
    id: `lab-containment-reminder-${index}` as Id<'careReminders'>,
    title,
    category,
    horseId: horses[index % horses.length]._id,
    horseName: horses[index % horses.length].name,
  }))
  const summary = {
    horseCount: horses.length,
    highSeverityIssueCount: 7,
    dueReminderCount: dueReminders.length,
    overdueReminderCount: dueReminders.filter((item) => item.overdue).length,
  }
  return {
    ...base,
    stable: { ...base.stable, name: 'Cedar Ridge Barn · sample yard' },
    horses,
    attentionHorses,
    dueReminders,
    urgentCount: summary.highSeverityIssueCount + summary.dueReminderCount,
    overview: {
      ...base.overview,
      attentionHorses,
      dueReminders,
      summary: { ...base.overview.summary, ...summary },
      stableSummaries: base.overview.stableSummaries.map((stable) =>
        stable.stableId === base.stable._id
          ? { ...stable, ...summary }
          : stable,
      ),
    },
  }
}
