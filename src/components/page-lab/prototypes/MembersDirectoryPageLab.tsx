import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { StableMembersPage } from '#/components/stables/StableMembersPage'
import { StableMemberDetailsFormView } from '#/components/stables/StableMemberDetailsForm'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

export function MembersDirectoryPageLab({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState('member')
  return (
    <DashboardPage>
      <Field>
        <FieldLabel htmlFor="member-directory-scenario">
          Sample directory
        </FieldLabel>
        <Select
          id="member-directory-scenario"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="member">Member and private profile</option>
          <option value="owner">Stable owner</option>
          <option value="large">50 members and long names</option>
          <option value="avatars">
            Avatar edge cases · local images and Unicode
          </option>
          <option value="empty">Empty directory</option>
        </Select>
      </Field>
      <DirectorySample
        key={`${data.stable._id}-${scenario}`}
        data={data}
        scenario={scenario}
      />
    </DashboardPage>
  )
}

function DirectorySample({
  data,
  scenario,
}: {
  data: DashboardLabData
  scenario: string
}) {
  const [member, setMember] = useState<Doc<'stableMembers'>>({
    _id: 'directory-sample-membership' as Id<'stableMembers'>,
    _creationTime: 0,
    stableId: data.stable._id,
    userId: 'directory-sample-user' as Id<'users'>,
    role: 'member',
    displayNameOverride: 'Alex Morgan',
    phone: '+48 500 123 456',
    emergencyContact: 'Sample contact: Jamie, +48 500 222 333',
  })
  const [outcome, setOutcome] = useState('success')
  const [pending, setPending] = useState(false)
  const [avatarPhoto, setAvatarPhoto] = useState('broken')
  const [message, setMessage] = useState(
    'Sample directory only. Profile changes stay in this preview; links lead to the real app and may require sign-in.',
  )
  const owner = scenario === 'owner'
  const people: ComponentProps<typeof StableMembersPage>['people'] =
    scenario === 'empty'
      ? []
      : [
          {
            membership: null,
            user: {
              _id: data.stable.ownerId,
              firstName: 'Mae',
              lastName: 'Turner',
              preferredName: undefined,
              photoUrl:
                scenario === 'avatars'
                  ? avatarPhoto === 'broken'
                    ? '/page-lab-samples/avatar-deliberately-missing.png'
                    : '/paddock-pilot-mark.svg'
                  : undefined,
            },
            role: 'owner',
            canEdit: false,
          },
          {
            membership: {
              ...member,
              role: 'member' as const,
              displayNameOverride: member.displayNameOverride,
            },
            user: {
              _id: member.userId,
              firstName: 'Alex',
              lastName: 'Morgan',
              preferredName: undefined,
              photoUrl: undefined,
            },
            role: 'member',
            canEdit: true,
          },
          ...(scenario === 'avatars'
            ? [
                {
                  membership: {
                    ...member,
                    role: 'member' as const,
                    _id: 'sample-unicode-membership' as Id<'stableMembers'>,
                    userId: 'sample-unicode-user' as Id<'users'>,
                    displayNameOverride: '𠮷野 花子',
                  },
                  user: {
                    _id: 'sample-unicode-user' as Id<'users'>,
                    firstName: '𠮷野',
                    lastName: '花子',
                    preferredName: undefined,
                    photoUrl: undefined,
                  },
                  role: 'member' as const,
                  canEdit: false,
                },
              ]
            : []),
          ...(scenario === 'large'
            ? Array.from({ length: 48 }, (_, index) => ({
                membership: {
                  ...member,
                  role: 'member' as const,
                  _id: `sample-membership-${index}` as Id<'stableMembers'>,
                  userId: `sample-user-${index}` as Id<'users'>,
                  displayNameOverride:
                    index === 0
                      ? 'Aleksandra Maria Wiśniewska-Kowalska'
                      : `Sample member ${index + 3}`,
                },
                user: {
                  _id: `sample-user-${index}` as Id<'users'>,
                  firstName: `Sample member ${index + 3}`,
                  lastName: undefined,
                  preferredName: undefined,
                  photoUrl: undefined,
                },
                role: 'member' as const,
                canEdit: false,
              }))
            : []),
        ]
  return (
    <>
      <DashboardSection>
        <FieldGrid>
          {scenario === 'avatars' && (
            <Field>
              <FieldLabel htmlFor="member-directory-avatar-photo">
                Sample avatar image
              </FieldLabel>
              <Select
                id="member-directory-avatar-photo"
                value={avatarPhoto}
                onChange={(event) => setAvatarPhoto(event.target.value)}
              >
                <option value="broken">Deliberately missing local image</option>
                <option value="available">
                  Available local image · app mark
                </option>
              </Select>
              <p>
                Mae’s image can fail or recover without remounting her row. The
                app mark is a sample image. The Unicode name should show 𠮷花
                initials.
              </p>
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="member-directory-outcome">
              Next sample save
            </FieldLabel>
            <Select
              id="member-directory-outcome"
              disabled={pending}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
        </FieldGrid>
        <p role="status">{message}</p>
      </DashboardSection>
      <StableMembersPage
        stable={data.stable}
        access={{ role: owner ? 'owner' : 'member' }}
        people={people}
        myDetails={owner ? null : member}
        renderDetailsForm={(props) => (
          <StableMemberDetailsFormView
            {...props}
            onSave={async (values) => {
              setPending(true)
              setMessage(
                'Sample request pending. Your saved profile has not changed.',
              )
              await new Promise((resolve) => window.setTimeout(resolve, 1200))
              setPending(false)
              if (outcome === 'failure') {
                setOutcome('success')
                setMessage(
                  'Sample request failed. Retry with the same entries.',
                )
                return false
              }
              setMember((current) => ({ ...current, ...values }))
              setMessage('Profile updated locally. No live membership changed.')
              return true
            }}
          />
        )}
      />
    </>
  )
}
