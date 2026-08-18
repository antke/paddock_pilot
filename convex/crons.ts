import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval(
  'purge horses deleted more than 14 days ago',
  { hours: 6 },
  internal.horses.purgeExpiredDeletedHorses,
)

crons.interval(
  'purge abandoned uploads older than 24 hours',
  { hours: 6 },
  internal.storageMaintenance.purgeOrphanedUploads,
  {},
)

crons.interval(
  'recover stalled email deliveries',
  { minutes: 5 },
  internal.emailMaintenance.recoverStalled,
  {},
)

crons.interval(
  'purge email delivery records older than 30 days',
  { hours: 24 },
  internal.emailMaintenance.purgeExpired,
  {},
)

export default crons
