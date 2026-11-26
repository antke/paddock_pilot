import type { Page } from '@playwright/test'
import { runInternal } from '../support/convexCli'
import { expect, expectNoGenericError, test } from '../support/fixtures'
import { users } from '../support/users'

// Riverside is the stable people join, leave and get removed from in this suite.
const people = (stableId: string) => `/stables/${stableId}/stable?tab=people`

test.describe.configure({ mode: 'serial' })

test('the owner invites someone, who accepts and sees the stable', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(people(seed.stables.riverside))
  await invite(owner, users.newcomer.email)
  await expect(owner.getByText('Invitation created')).toBeVisible()

  // A pending invite takes the invitee straight to it.
  const newcomer = await as('newcomer')
  await newcomer.goto('/')
  await expect(newcomer).toHaveURL(/\/invitations\//)
  await newcomer.getByRole('button', { name: 'Accept invitation' }).click()
  await expect(newcomer.getByText('Welcome to Riverside Yard')).toBeVisible()
  // New members start in the stable's onboarding, with the stable in their sidebar.
  await newcomer.goto(`/stables/${seed.stables.riverside}`)
  await expect(
    newcomer.getByRole('heading', { name: 'Welcome to Riverside Yard' }),
  ).toBeVisible()
  await expect(
    newcomer.getByRole('link', { name: 'Riverside Yard' }).first(),
  ).toBeVisible()
})

test('re-inviting an email that is already invited says to resend it from the list', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(people(seed.stables.riverside))
  const email = 'pp-e2e-pending+clerk_test@example.com'
  await invite(owner, email)
  await expect(owner.getByText('Invitation created')).toBeVisible()
  await expect(
    owner.getByRole('dialog', { name: 'Invite member' }),
  ).toBeHidden()
  // Just sent, so Resend waits out the server's one-minute cooldown instead of failing.
  await expect(
    owner
      .getByRole('listitem')
      .filter({ hasText: email })
      .getByRole('button', { name: 'Email queued' }),
  ).toBeDisabled()
  await invite(owner, email)
  await expect(owner.getByRole('dialog')).toContainText(
    'This email is already on your invite list, even if that invite expired. Resend it from there.',
  )
  await expectNoGenericError(owner)
})

test('the owner removes a member, who loses access to the stable', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(people(seed.stables.riverside))
  const row = owner.getByRole('listitem').filter({ hasText: 'Nina Newcomer' })
  await row.getByRole('button', { name: 'Remove' }).click()
  const dialog = owner.getByRole('alertdialog', {
    name: 'Remove Nina Newcomer?',
  })
  await dialog.getByRole('button', { name: 'Remove member' }).click()
  await expect(owner.getByText('Member removed')).toBeVisible()

  const newcomer = await as('newcomer')
  await newcomer.goto(`/stables/${seed.stables.riverside}`)
  await expect(newcomer.getByText('You can’t open this stable')).toBeVisible()
  await expectNoGenericError(newcomer)
  await expect(
    newcomer.getByRole('link', { name: 'Riverside Yard' }),
  ).toHaveCount(0)
  await expect(
    newcomer.getByRole('heading', { name: 'Welcome to Riverside Yard' }),
  ).toHaveCount(0)
})

test('a member leaves a stable and loses access', async ({ as, seed }) => {
  const leaver = await as('leaver')
  await leaver.goto(people(seed.stables.riverside))
  await leaver.getByRole('button', { name: 'Leave stable' }).click()
  await leaver
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Leave stable' })
    .click()
  await expect(leaver).toHaveURL(/\/stables\/?$/)
  await expect(
    leaver.getByRole('link', { name: 'Riverside Yard' }),
  ).toHaveCount(0)
  await leaver.goto(people(seed.stables.riverside))
  await expect(leaver.getByText('You can’t open this stable')).toBeVisible()

  const owner = await as('owner')
  await owner.goto(people(seed.stables.riverside))
  await expect(owner.getByText('Max Member').first()).toBeVisible()
  await expect(
    owner.getByRole('listitem').filter({ hasText: 'Lena Leaver' }),
  ).toHaveCount(0)
})

test('an old invitation link no longer offers “Continue to stable” after leaving', async ({
  as,
}) => {
  const token = runInternal('e2e:latestEmailToken', {
    recipient: users.leaver.email,
  })
  const leaver = await as('leaver')
  await leaver.goto(`/invitations/${token}`)
  await expect(
    leaver.getByRole('heading', { name: 'Riverside Yard' }).first(),
  ).toBeVisible()
  await expect(
    leaver.getByText('You’re no longer in Riverside Yard'),
  ).toBeVisible()
  await expect(leaver.getByRole('link', { name: /Continue to/ })).toHaveCount(0)
})

async function invite(page: Page, email: string) {
  await page.getByRole('button', { name: 'Invite member' }).click()
  const dialog = page.getByRole('dialog', { name: 'Invite member' })
  await dialog.getByLabel('Email address').fill(email)
  await dialog.getByRole('button', { name: 'Invite', exact: true }).click()
}
