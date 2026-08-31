export type LandingOutcome = {
  label: string
  title: string
  description: string
  tone: 'primary' | 'warning' | 'danger'
}

export type LandingProductShot = {
  alt: string
  caption: string
  height: number
  src: string
  title: string
  width: number
}

export type LandingWorkflowStep = {
  description: string
  icon: 'calendar' | 'horse' | 'handoff'
  label: string
  title: string
  tone: 'primary' | 'warning' | 'danger'
}

export type LandingFaq = {
  answer: string
  question: string
}

export const landingPreviewEvents = [
  { label: 'Lameness recheck', detail: 'Today · 10:30' },
  { label: 'Farrier reset', detail: '2 horses · Thursday' },
  { label: 'Vaccination record', detail: 'Document attached' },
]

export const landingOutcomes = [
  {
    label: '01',
    title: 'See what needs attention',
    description: 'Appointments, reminders, and horses requiring follow-up.',
    tone: 'danger',
  },
  {
    label: '02',
    title: 'Keep context with the horse',
    description: 'Nutrition, health, medication, documents, and care history.',
    tone: 'primary',
  },
  {
    label: '03',
    title: 'Prepare a clear handoff',
    description:
      'Provider details and visit notes without searching old messages.',
    tone: 'warning',
  },
] satisfies ReadonlyArray<LandingOutcome>

export const landingProductShots = {
  commandCenter: {
    src: '/landing/stable-command-center.png',
    width: 1440,
    height: 900,
    alt: 'Cedar Ridge Barn dashboard showing today’s appointment, priority queue, and horse roster.',
    title: 'Cedar Ridge Barn command center',
    caption:
      'Today’s appointments, priority care, horse roster, calendar, and care board in one working view.',
  },
  horseRecord: {
    src: '/landing/horse-record.png',
    width: 1304,
    height: 470,
    alt: 'Juniper horse profile showing identification details and stable records.',
    title: 'Juniper’s horse record',
    caption:
      'Profile, nutrition, care, activity, and documents remain attached to the horse.',
  },
  providerVisit: {
    src: '/landing/provider-visit.png',
    width: 1304,
    height: 660,
    alt: 'Completed dental visit showing its provider, date, status, and completion notes.',
    title: 'A provider-ready visit',
    caption:
      'Timing, attached horses, provider details, cost, and follow-up context remain together.',
  },
} satisfies Record<string, LandingProductShot>

export const landingWorkflowSteps = [
  {
    label: 'Step 01',
    title: 'Plan the work',
    description:
      'See appointments, reminders, and horses needing attention in one daily view.',
    icon: 'calendar',
    tone: 'primary',
  },
  {
    label: 'Step 02',
    title: 'Record the outcome',
    description:
      'Add care notes, nutrition changes, medication, and documents to the horse record—not a chat thread.',
    icon: 'horse',
    tone: 'warning',
  },
  {
    label: 'Step 03',
    title: 'Hand off clearly',
    description:
      'Open the horse, provider, and visit context before the next care decision.',
    icon: 'handoff',
    tone: 'danger',
  },
] satisfies ReadonlyArray<LandingWorkflowStep>

export const landingFaqs = [
  {
    question: 'What can I keep in a horse profile?',
    answer:
      'Horse profiles can hold identification details, care contacts, nutrition information, health and medication context, documents, and activity connected to that horse.',
  },
  {
    question: 'Can I use it to coordinate provider visits?',
    answer:
      'Yes. Events can keep the date, time, provider details, attached horses, location, cost, and completion notes together.',
  },
  {
    question: 'Can stable members use Paddock Pilot too?',
    answer:
      'Yes. Stable members can accept an invitation and use the shared stable without a separate subscription. During testing, no payment is required.',
  },
  {
    question: 'What does Premium add?',
    answer:
      'The future premium plan adds the Analysis Centre. Documents, printable care summaries, and the rest of the current coordination toolkit remain core features.',
  },
  {
    question: 'Does Paddock Pilot replace veterinary advice?',
    answer:
      'No. Paddock Pilot is a record-keeping and coordination tool. Care and treatment decisions should still be made with the appropriate professional.',
  },
] satisfies ReadonlyArray<LandingFaq>
