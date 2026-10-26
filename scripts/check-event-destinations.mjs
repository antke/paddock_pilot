import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { webkit } from 'playwright'

// Same local-only Page Lab workflow as check-webkit-forms.mjs. No live mutations.
const baseURL = new URL(process.env.FORM_TEST_URL ?? 'http://localhost:9090')
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(baseURL.hostname))
const output = '.impeccable/review/event-destinations'
await mkdir(output, { recursive: true })
const browser = await webkit.launch()
const results = []
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: mobile ? 390 : 1280, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
      colorScheme: mobile ? 'dark' : 'light',
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.stack ?? error.message))
    await page.goto(new URL('/page-lab/forms', baseURL).href)
    const form = page.locator('form[data-slot="route-form-card"]')
    await form.waitFor({ timeout: 30000 })
    // The dev-only inspector launcher covers the mobile submit control.
    // Hide only that launcher; leave all application chrome unchanged.
    await page.addStyleTag({
      content:
        '[aria-label="Open TanStack Devtools"] { display: none !important; }',
    })
    await page.getByLabel('Sample form').selectOption('create')
    if (mobile)
      await page.getByLabel('Language', { exact: true }).selectOption('pl')
    const destination = page.getByLabel(mobile ? 'Utwórz w' : 'Create in', {
      exact: true,
    })
    const stable = await destination.inputValue()
    const title = form.getByLabel(mobile ? 'Tytuł' : 'Title', { exact: true })
    await title.fill('Destination QA — local fixture only')
    const horses = form.locator('input[name="horseIds"]')
    assert.equal(await horses.count(), 3)
    await horses.nth(0).locator('..').click()
    await horses.nth(1).locator('..').click()
    await horses.nth(1).focus()
    await page.keyboard.press('Space')
    assert.equal(await horses.nth(1).isChecked(), false)
    await page.keyboard.press('Space')
    assert.equal(await horses.nth(1).isChecked(), true)
    assert.equal(
      await form
        .getByText(mobile ? 'Wymaga akceptacji' : 'Requires approval', {
          exact: true,
        })
        .count(),
      2,
    )
    await form.locator('button[type=submit]').click({ trial: true })
    await page.evaluate(() => document.fonts.ready)
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      'Horizontal overflow',
    )
    await form.screenshot({
      path: `${output}/${mobile ? 'mobile-pl' : 'desktop-en'}.png`,
      animations: 'disabled',
    })
    await form.evaluate((element) =>
      window.scrollTo(
        0,
        element.getBoundingClientRect().top + window.scrollY - 90,
      ),
    )
    await page.screenshot({
      path: `${output}/${mobile ? 'mobile-pl' : 'desktop-en'}-viewport.png`,
      animations: 'disabled',
    })
    await destination.selectOption('')
    const dialog = page.getByRole('alertdialog')
    await dialog.waitFor()
    assert.ok((await dialog.innerText()).includes('Atlas'))
    await dialog
      .getByRole('button', {
        name: mobile ? 'Zostań w tej przestrzeni' : 'Keep current space',
      })
      .click()
    assert.equal(await destination.inputValue(), stable)
    assert.equal(await horses.nth(1).isChecked(), true)
    await destination.selectOption('')
    await dialog
      .getByRole('button', {
        name: mobile
          ? 'Usuń konie i zmień przestrzeń'
          : 'Remove horses and switch',
      })
      .click()
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(await destination.inputValue(), '')
    assert.equal(await horses.count(), 1)
    assert.equal(await horses.nth(0).isChecked(), true)
    assert.equal(
      await title.inputValue(),
      'Destination QA — local fixture only',
    )
    assert.ok(
      await form
        .getByText(
          mobile ? /Nie jest udostępniane stajni/ : /Not shared with a stable/,
        )
        .isVisible(),
    )
    await form
      .getByRole('button', {
        name: mobile ? 'Trening' : 'Training',
        exact: true,
      })
      .click()
    assert.ok(
      await form
        .getByText(
          mobile
            ? 'Wybierz wszystkie aktywności wykonywane podczas treningu.'
            : 'Select all activities practised in this session.',
          { exact: true },
        )
        .isVisible(),
    )
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    await form.screenshot({
      path: `${output}/${mobile ? 'mobile-pl' : 'desktop-en'}-private-training.png`,
      animations: 'disabled',
    })
    // Development-only router inspector currently errors in WebKit; retain it
    // in the report while requiring the actual application to be error-free.
    const devtoolsErrors = errors.filter(
      (error) =>
        error.includes('path.endsWith is not a function') &&
        error.includes('@tanstack/router-devtools-core'),
    )
    assert.deepEqual(
      errors.filter((error) => !devtoolsErrors.includes(error)),
      [],
    )
    results.push({
      mobile,
      locale: mobile ? 'pl' : 'en',
      width: mobile ? 390 : 1280,
      destinationFiltering: true,
      keyboardHorseSelection: true,
      submitClickable: true,
      devtoolsLauncherHidden: true,
      cancelPreservesSelection: true,
      confirmedSwitchPreservesDraft: true,
      privateTraining: true,
      horizontalOverflow: false,
      errors,
      devtoolsErrors,
    })
    await context.close()
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
  await browser.close()
}
console.log(
  `Passed ${results.length} WebKit destination flows (desktop English / mobile Polish).`,
)
