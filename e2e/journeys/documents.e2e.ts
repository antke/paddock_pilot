import { expect, test } from '../support/fixtures'

const pdf = (bytes: number) => {
  const buffer = Buffer.alloc(bytes, 0x20)
  buffer.write('%PDF-1.4\n')
  return buffer
}

test('the stable owner uploads a document that members can see', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(`/stables/${seed.stables.hilltop}/stable?tab=documents`)
  await owner.getByRole('button', { name: 'Add document' }).first().click()
  const dialog = owner.getByRole('dialog', { name: 'Add document' })
  await dialog.getByLabel('File (required)').setInputFiles({
    name: 'yard-insurance.pdf',
    mimeType: 'application/pdf',
    buffer: pdf(2048),
  })
  await dialog.getByLabel('Document name').fill('Yard insurance 2027')
  await dialog.getByRole('button', { name: 'Add document' }).click()
  await expect(owner.getByText('Document added')).toBeVisible()

  const member = await as('member')
  await member.goto(`/stables/${seed.stables.hilltop}/stable?tab=documents`)
  await expect(member.getByText('Yard insurance 2027')).toBeVisible()
})

test('a file over 25 MB is refused in the form before anything uploads', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  const uploads: Array<string> = []
  owner.on('request', (request) => {
    if (request.url().includes('/api/storage/upload'))
      uploads.push(request.url())
  })
  await owner.goto(`/stables/${seed.stables.hilltop}/stable?tab=documents`)
  await owner.getByRole('button', { name: 'Add document' }).first().click()
  const dialog = owner.getByRole('dialog', { name: 'Add document' })
  await dialog.getByLabel('File (required)').setInputFiles({
    name: 'huge-scan.pdf',
    mimeType: 'application/pdf',
    buffer: pdf(25 * 1024 * 1024 + 1),
  })
  await dialog.getByRole('button', { name: 'Add document' }).click()
  await expect(
    dialog.getByText(
      'This file is over 25 MB. Pick a smaller one or compress it first.',
    ),
  ).toBeVisible()
  await expect(owner.getByText('Document added')).toHaveCount(0)
  expect(uploads).toEqual([])
})
