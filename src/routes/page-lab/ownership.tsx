import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import type { Id, Doc } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import {
  HorseManagementView,
  DepartureReviewView,
} from '#/components/ownership/HorseManagement'
import { Button } from '#/components/ui/button'
import { PersonalContactsView } from '#/components/ownership/PersonalContacts'
import { HorseInvitationView } from '#/components/ownership/HorseInvitation'
import { PersonalAppointmentsView } from '#/components/ownership/PersonalAppointments'
import { Select } from '#/components/ui/select'
import { Field, FieldLabel } from '#/components/ui/field'

export const Route = createFileRoute('/page-lab/ownership')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: OwnershipSample,
})
const horseId = 'sample-juniper' as Id<'horses'>
const ownerId = 'sample-owner' as Id<'users'>
const stableId = 'sample-willow' as Id<'stables'>
const time = Date.UTC(2026, 8, 1)
function OwnershipSample() {
  const [screen, setScreen] = useState('management')
  const [appointmentView, setAppointmentView] = useState<'list' | 'calendar'>(
    'list',
  )
  const [contacts, setContacts] = useState<Array<Doc<'personalProviders'>>>([
    {
      _id: 'sample-vet' as Id<'personalProviders'>,
      _creationTime: time,
      userId: ownerId,
      name: 'Alexandra Montgomery-Wetherby',
      type: 'vet',
      phone: '+48 123 456 789',
      createdAt: time,
    },
  ])
  const [personal, setPersonal] = useState(false)
  const [message, setMessage] = useState('')
  const stable = personal
    ? null
    : {
        _id: stableId,
        _creationTime: time,
        name: 'Willow & Oak Stables',
        location: 'Warsaw',
        ownerId: 'sample-admin' as Id<'users'>,
      }
  const acknowledged = async () => {
    setMessage('Saved in this local sample. No invitation was sent.')
  }
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Juniper"
        description="Ownership and stable placement · Local sample"
        actions={
          <Button variant="outline" onClick={() => setPersonal(!personal)}>
            {personal ? 'Show connected stable' : 'Show personal care'}
          </Button>
        }
      />
      <Field>
        <FieldLabel htmlFor="sample-screen">Local preview screen</FieldLabel>
        <Select
          id="sample-screen"
          value={screen}
          onChange={(event) => setScreen(event.target.value)}
        >
          <option value="management">People, stable and deletion</option>
          <option value="contacts">Care contacts</option>
          <option value="invitation">Invitation — wrong account</option>
          <option value="expired">Invitation — expired</option>
          <option value="appointments">Appointments</option>
        </Select>
      </Field>
      {message && <p role="status">{message}</p>}
      {screen === 'contacts' && (
        <PersonalContactsView
          providers={contacts}
          save={async (input) => {
            setContacts((rows) =>
              input.id
                ? rows.map((row) =>
                    row._id === input.id ? { ...row, ...input } : row,
                  )
                : [
                    ...rows,
                    {
                      ...input,
                      _id: `sample-${rows.length}` as Id<'personalProviders'>,
                      _creationTime: time,
                      userId: ownerId,
                      createdAt: time,
                    },
                  ],
            )
            return input.id
          }}
          remove={async ({ id }) => {
            setContacts((rows) => rows.filter((row) => row._id !== id))
          }}
        />
      )}
      {(screen === 'invitation' || screen === 'expired') && (
        <HorseInvitationView
          status={screen === 'expired' ? 'expired' : 'wrong_account'}
          accountActions={
            <Button onClick={acknowledged}>Switch account (sample)</Button>
          }
          onRespond={acknowledged}
        />
      )}
      {screen === 'appointments' && (
        <PersonalAppointmentsView
          events={sampleEvents}
          view={appointmentView}
          onViewChange={setAppointmentView}
        />
      )}
      {screen === 'management' && (
        <HorseManagementView
          horseId={horseId}
          data={{
            horseName: 'Juniper',
            ownerName: 'Taylor Evans',
            stableAdminName: 'Robin Brooks',
            access: {
              userId: ownerId,
              stable,
              isOwner: true,
              isAdmin: false,
              isCustodian: false,
              role: 'member',
              carerRole: undefined,
              canRead: true,
              canEditProfile: true,
              canAddRecords: true,
              canEditPersonalRecords: true,
              canManageAccess: true,
              canMove: true,
              canTransfer: true,
              canDelete: true,
            },
            placements: stable
              ? [
                  {
                    _id: 'sample-placement' as Id<'horsePlacements'>,
                    _creationTime: time,
                    horseId,
                    stableId,
                    createdBy: ownerId,
                    startedAt: time,
                    stableName: stable.name,
                  },
                ]
              : [],
            carers: [
              {
                _id: 'sample-carer' as Id<'horseCarers'>,
                _creationTime: time,
                horseId,
                userId: 'sample-friend' as Id<'users'>,
                role: 'viewer',
                invitedBy: ownerId,
                createdAt: time,
                name: 'Alexandra Montgomery-Wetherby',
                email: 'alexandra@example.test',
              },
            ],
            invitations: [],
            audit: [],
          }}
          stables={[
            { _id: stableId, name: 'Willow & Oak Stables' },
            {
              _id: 'sample-meadow' as Id<'stables'>,
              name: 'Meadowbrook Stables',
            },
          ]}
          invite={acknowledged}
          updateCarer={acknowledged}
          revoke={acknowledged}
          connect={acknowledged}
          archive={acknowledged}
          renderDeparture={(props) => (
            <DepartureReviewView
              {...props}
              preview={{
                revision: 'sample-review',
                events: [
                  {
                    _id: 'sample-visit',
                    title: 'Weekly farrier visit',
                    date: '2026-10-14',
                  },
                ],
                reminders: [
                  {
                    _id: 'sample-task' as Id<'careReminders'>,
                    title: 'Book a follow-up dental check',
                  },
                ],
              }}
              submit={async () => {
                setPersonal(!props.targetStableId)
                setMessage('Local sample updated. No real horse was moved.')
              }}
            />
          )}
        />
      )}
    </DashboardPage>
  )
}
const sampleEvents: Array<Doc<'events'>> = [
  {
    _id: 'sample-lesson' as Id<'events'>,
    _creationTime: time,
    createdBy: ownerId,
    horseIds: [horseId],
    title: 'Weekly care appointment',
    type: 'vet',
    date: '2026-09-01',
    time: '10:00',
    status: 'planned',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [2],
      end: { type: 'never' },
    },
  },
  {
    _id: 'sample-dentist' as Id<'events'>,
    _creationTime: time,
    createdBy: ownerId,
    horseIds: [horseId],
    title: 'Dental check',
    type: 'dentist',
    date: '2026-10-20',
    time: '11:30',
    status: 'planned',
  },
]
