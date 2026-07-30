import type {
  HealthIssueSeverity,
  HealthIssueStatus,
} from 'shared/horses/healthIssueSchema'
import type { MedicationRecordStatus } from 'shared/horses/medicationRecordSchema'

export const horseHealthIssueSeverityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<HealthIssueSeverity, string>

export const horseHealthIssueStatusLabels = {
  active: 'Active',
  resolved: 'Resolved',
} satisfies Record<HealthIssueStatus, string>

export const horseMedicationStatusLabels = {
  active: 'Active',
  completed: 'Completed',
} satisfies Record<MedicationRecordStatus, string>
