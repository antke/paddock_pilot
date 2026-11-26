import { readFileSync } from 'node:fs'
import type { UserKey } from './users'

export const seedPath = 'e2e/.auth/seed.json'

export type SeedData = {
  users: Record<UserKey, string>
  stables: { hilltop: string; riverside: string; oldBarn: string }
  horses: Record<string, string>
  events: Record<string, string>
  reminders: Record<string, string>
  dates: Record<string, string>
}

/** Ids written by global setup, read inside tests. */
export const seedData = (): SeedData =>
  JSON.parse(readFileSync(seedPath, 'utf8'))

/** A YYYY-MM-DD key `offset` days from today in the browser's time zone. */
export const dateKey = (offset: number, timeZone = 'Europe/Warsaw') => {
  const date = new Date(Date.now() + offset * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)
}
