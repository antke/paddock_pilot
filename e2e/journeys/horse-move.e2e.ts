import { runInternal } from '../support/convexCli'
import { expect, expectNoGenericError, test } from '../support/fixtures'

test('an owner moves their horse to another stable and the old stable’s events follow', async ({
  as,
  seed,
}) => {
  const max = await as('member2')
  await max.goto(`/horses/${seed.horses.juniper}/manage`)
  await max
    .getByLabel('Where will this horse live?')
    .selectOption({ label: 'Riverside Yard' })
  await max.getByRole('button', { name: 'Review this move' }).click()
  // The review lists the appointment the horse will be withdrawn from.
  await expect(
    max.getByRole('listitem').filter({ hasText: 'Spring vet check ·' }),
  ).toBeVisible()
  await max.getByRole('button', { name: 'Move to Riverside Yard' }).click()

  // Reload mid-move: the manage page must keep working while history is copied.
  await max.reload()
  await expect(
    max.getByRole('heading', { name: 'Juniper' }).first(),
  ).toBeVisible()
  await expectNoGenericError(max)
  await expect(max.getByText('Moving the horse…')).toHaveCount(0, {
    timeout: 30_000,
  })
  await expect(max.getByLabel('Where will this horse live?')).toBeVisible()

  const owner = await as('owner')
  await owner.goto(`/stables/${seed.stables.riverside}/horses`)
  await expect(owner.getByText('Juniper').first()).toBeVisible()

  // Future appointments at the old stable drop the horse; past ones keep it as history.
  await owner.goto(`/events/${seed.events.futureVetCheck}`)
  await expect(
    owner.getByRole('heading', { name: 'Spring vet check', level: 1 }),
  ).toBeVisible()
  await expect(
    owner.getByRole('listitem').filter({ hasText: 'Bramble' }),
  ).toContainText('Confirmed')
  await expect(
    owner
      .getByRole('listitem')
      .filter({ hasText: 'Juniper' })
      .filter({ hasText: 'Confirmed' }),
  ).toHaveCount(0)

  // The old stable loses access to the departed horse, even on past events…
  await owner.goto(`/events/${seed.events.pastJuniperClinic}`)
  await expect(
    owner.getByRole('heading', { name: 'Past jumping clinic', level: 1 }),
  ).toBeVisible()
  await expect(owner.getByText('Juniper')).toHaveCount(0)
  await expectNoGenericError(owner)

  // …while the horse's owner keeps it in Juniper's history.
  await max.goto(
    `/events/${seed.events.pastJuniperClinic}?horseId=${seed.horses.juniper}`,
  )
  await expect(
    max.getByRole('heading', { name: 'Past jumping clinic', level: 1 }),
  ).toBeVisible()
  await expect(max.getByText('Juniper').first()).toBeVisible()
  await expectNoGenericError(max)
})

test('while a horse is mid-move, its owner sees why and isn’t offered another move', async ({
  as,
  seed,
}) => {
  const manage = `/horses/${seed.horses.hazel}/manage`
  const max = await as('member2')
  // A real move finishes in about a second, so freeze one to look at it.
  runInternal('e2e:holdMove', { horseId: seed.horses.hazel, hold: true })
  try {
    await max.goto(manage)
    await expect(max.getByText('Moving the horse…')).toBeVisible()
    await expect(max.getByLabel('Where will this horse live?')).toHaveCount(0)
    await expectNoGenericError(max)
  } finally {
    runInternal('e2e:holdMove', { horseId: seed.horses.hazel, hold: false })
  }
  await expect(max.getByText('Moving the horse…')).toHaveCount(0)
  await expect(max.getByLabel('Where will this horse live?')).toBeVisible()
})
