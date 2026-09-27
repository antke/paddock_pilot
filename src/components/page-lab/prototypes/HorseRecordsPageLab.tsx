import { memo, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Doc } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DetailStack } from '#/components/dashboard/DetailBlocks'
import { HorseCareSection } from '#/components/horses/HorseCareSection'
import { HorseNutritionSection } from '#/components/horses/HorseNutritionSection'
import type { HorseDetailHorse } from '#/components/horses/HorseDetail'
import { HorseCareRemindersView } from '#/components/reminders/HorseCareRemindersCard'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import {
  HealthIssuesSample,
  MedicationRecordsSample,
} from './HorseHealthRecordsSample'
import {
  NutritionLogsSample,
  WeightRecordsSample,
} from './HorseNutritionRecordsSample'

export function HorseRecordsPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Record simulations require development sample data.
      </DashboardEmptyState>
    )
  return <HorseRecordsSample key={data.stable._id} data={data} />
}

function HorseRecordsSample({ data }: { data: DashboardLabData }) {
  const id = useId()
  const [section, setSection] = useState('care')
  const [horseId, setHorseId] = useState(data.horses[0]?._id)
  const horse = data.horses.find((item) => item._id === horseId)
  if (!horse)
    return (
      <DashboardEmptyState>No sample horses are available.</DashboardEmptyState>
    )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={`${horse.name} — records sample`}
        description="Actual care and nutrition sections with local records. Saves and removals affect this preview only."
      />
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${id}-horse`}>Sample horse</FieldLabel>
          <Select
            id={`${id}-horse`}
            value={horseId}
            onChange={(event) =>
              setHorseId(event.target.value as Doc<'horses'>['_id'])
            }
          >
            {data.horses.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-section`}>Sample section</FieldLabel>
          <Select
            id={`${id}-section`}
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            <option value="care">Care</option>
            <option value="nutrition">Nutrition</option>
          </Select>
        </Field>
      </FieldGrid>
      {section === 'care' ? (
        <HorseCareSection
          key={horse._id}
          stableId={data.stable._id}
          horse={horse}
          events={[]}
          renderReminders={(onCreateActionChange) => (
            <HorseRemindersSample
              horse={horse}
              onCreateActionChange={onCreateActionChange}
            />
          )}
          renderHealthIssues={(onCreateActionChange) => (
            <HealthIssuesSample
              horse={horse}
              onCreateActionChange={onCreateActionChange}
            />
          )}
        />
      ) : (
        <HorseNutritionSection
          key={horse._id}
          stableId={data.stable._id}
          horse={horse}
          events={[]}
          renderLogs={(onCreateActionChange) => (
            <NutritionLogsSample
              horse={horse}
              onCreateActionChange={onCreateActionChange}
            />
          )}
          renderWeight={(onCreateActionChange) => (
            <WeightRecordsSample
              horse={horse}
              onCreateActionChange={onCreateActionChange}
            />
          )}
          renderMedication={(onCreateActionChange) => (
            <MedicationRecordsSample
              horse={horse}
              onCreateActionChange={onCreateActionChange}
            />
          )}
        />
      )}
    </DashboardPage>
  )
}

const HorseRemindersSample = memo(function HorseReminderSampleContent({
  horse,
  onCreateActionChange,
}: {
  horse: HorseDetailHorse
  onCreateActionChange: (action: ReactNode | null) => void
}) {
  const id = useId()
  const [readOnly, setReadOnly] = useState(false)
  const [message, setMessage] = useState(
    'Sample reminders for this horse. All changes stay in this preview.',
  )
  const generation = useRef(0)
  const serial = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const [records, setRecords] = useState<Array<Doc<'careReminders'>>>(() => [
    {
      _id: 'sample-horse-reminder' as Doc<'careReminders'>['_id'],
      _creationTime: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: horse.ownerId,
      stableId: horse.stableId,
      horseId: horse._id,
      title: 'Sample follow-up with the farrier',
      category: 'farrier',
      dueDate: getTodayDateKey(),
      status: 'pending',
      priority: 'medium',
    },
  ])
  const apply = async (update: () => void) => {
    const current = generation.current
    setMessage('Sample request pending. No record has changed yet.')
    await new Promise((resolve) => setTimeout(resolve, 350))
    if (current !== generation.current) throw new Error('Sample changed')
    update()
    setMessage('Reminder updated locally. No live record changed.')
  }
  return (
    <DetailStack>
      <Field>
        <FieldLabel htmlFor={`${id}-permission`}>
          Sample reminder access
        </FieldLabel>
        <Select
          id={`${id}-permission`}
          value={readOnly ? 'viewer' : 'manager'}
          onChange={(event) => setReadOnly(event.target.value === 'viewer')}
        >
          <option value="manager">Manage reminders</option>
          <option value="viewer">Read-only</option>
        </Select>
      </Field>
      <p role="status">{message}</p>
      <HorseCareRemindersView
        horse={horse}
        records={records}
        canManage={!readOnly}
        onCreateActionChange={onCreateActionChange}
        onAdd={(values) =>
          apply(() =>
            setRecords((current) => [
              ...current,
              {
                _id: `sample-reminder-${++serial.current}` as Doc<'careReminders'>['_id'],
                _creationTime: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: horse.ownerId,
                stableId: horse.stableId,
                horseId: horse._id,
                title: values.title,
                description: values.description,
                category: values.category,
                dueDate: values.dueDate,
                priority: values.priority,
                status: 'pending',
              },
            ]),
          )
        }
        onComplete={(record) =>
          apply(() =>
            setRecords((current) =>
              current.map((item) =>
                item._id === record._id
                  ? { ...item, status: 'completed', completedAt: Date.now() }
                  : item,
              ),
            ),
          )
        }
        onDismiss={(record) =>
          apply(() =>
            setRecords((current) =>
              current.map((item) =>
                item._id === record._id
                  ? { ...item, status: 'dismissed' }
                  : item,
              ),
            ),
          )
        }
        onRemove={(record) =>
          apply(() =>
            setRecords((current) =>
              current.filter((item) => item._id !== record._id),
            ),
          )
        }
      />
    </DetailStack>
  )
})
