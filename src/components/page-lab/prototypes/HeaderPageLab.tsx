import { useId, useState } from 'react'
import { ActiveStableNavigation, HeaderView } from '#/components/Header'
import { StableSwitcherView } from '#/integrations/clerk/header-user'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Button, ButtonLink } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

const stables = [
  {
    _id: 'sample-header-stable',
    name: 'Cedar Ridge and Northern Pastures Riding Stables',
  },
  { _id: 'sample-header-annex', name: 'North Pasture Annex' },
]

export function HeaderPageLab() {
  const fixture = useDevAuthBypassEnabled()
  const id = useId()
  const [mode, setMode] = useState('owner')
  const [stableId, setStableId] = useState(stables[0]._id)
  const [section, setSection] = useState('horses')
  const [message, setMessage] = useState('No sample menu action yet.')
  if (!import.meta.env.DEV || !fixture)
    return (
      <DashboardEmptyState>
        Header samples are available only in local fixture mode.
      </DashboardEmptyState>
    )
  return (
    <DashboardSection>
      <DashboardPageHeader
        title="Application header"
        description="Actual navigation and stable-switcher components with fictional stables. Menu actions stay here; navigation links lead to real routes. The account widget is represented by a labelled sample button, not a working sign-in."
      />
      <Field>
        <FieldLabel htmlFor={`${id}-mode`}>Sample navigation</FieldLabel>
        <Select
          id={`${id}-mode`}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="owner">Stable owner</option>
          <option value="member">Stable member</option>
          <option value="anonymous">Signed out</option>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-section`}>Sample active page</FieldLabel>
        <Select
          id={`${id}-section`}
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="home">Home</option>
          <option value="horses">Horses</option>
          <option value="reminders">Care</option>
          <option value="events">Events</option>
          <option value="events/calendar">Calendar</option>
          <option value="documents">Documents</option>
          <option value="analysis">Analysis</option>
        </Select>
      </Field>
      <HeaderView
        position="static"
        navigationLabel="Sample application navigation"
        navigation={
          mode === 'anonymous' ? (
            <ButtonLink to="/pricing" variant="ghost" size="sm">
              Plans
            </ButtonLink>
          ) : (
            <ActiveStableNavigation
              stableId={stableId}
              pathname={
                section === 'home' ? '/' : `/stables/${stableId}/${section}`
              }
            />
          )
        }
        accountActions={
          mode === 'anonymous' ? (
            <>
              <ButtonLink to="/sign-in/$" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/sign-up/$" size="sm">
                Create account
              </ButtonLink>
            </>
          ) : (
            <>
              <StableSwitcherView
                stables={stables}
                activeStableId={stableId}
                onStableChange={setStableId}
                canManage={mode === 'owner'}
                onOpen={(destination) =>
                  setMessage(
                    `Sample ${destination} menu action selected. No navigation or account change.`,
                  )
                }
              />
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Sample account"
                onClick={() =>
                  setMessage(
                    'Account controls belong to the authentication provider; this sample does not open them.',
                  )
                }
              >
                A
              </Button>
            </>
          )
        }
      />
      <p role="status">{message}</p>
    </DashboardSection>
  )
}
