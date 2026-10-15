import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { webkit } from 'playwright'

// Uses local-only Page Lab callbacks; never submits records to a live backend.
const baseURL = new URL(process.env.FORM_TEST_URL ?? 'http://localhost:9090')
assert.ok(
  ['localhost', '127.0.0.1', '[::1]'].includes(baseURL.hostname),
  'Run form layout checks against a local development server.',
)
const output = '.browser-checks/webkit-forms'
await mkdir(output, { recursive: true })
const browser = await webkit.launch()
const results = []

// Runs in WebKit. Ignore deliberately clipped accessibility/proxy inputs.
function inspectLayout(root) {
  const visible = (element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return (
      rect.width > 2 &&
      rect.height > 2 &&
      !element.closest('[hidden], [inert]') &&
      !element.classList.contains('sr-only') &&
      style.visibility !== 'hidden' &&
      style.clipPath !== 'inset(50%)'
    )
  }
  const name = (element) =>
    (element.querySelector('label')?.textContent ?? element.textContent)
      .trim()
      .slice(0, 80)
  const fields = [...root.querySelectorAll('[data-slot="field"]')].filter(
    visible,
  )
  const issues = []
  for (const [index, field] of fields.entries()) {
    const rect = field.getBoundingClientRect()
    for (const other of fields.slice(index + 1)) {
      if (field.contains(other) || other.contains(field)) continue
      const next = other.getBoundingClientRect()
      if (
        Math.min(rect.right, next.right) - Math.max(rect.left, next.left) > 2 &&
        Math.min(rect.bottom, next.bottom) - Math.max(rect.top, next.top) > 2
      ) {
        issues.push(`Overlapping fields: ${name(field)} / ${name(other)}`)
      }
    }
    for (const child of [...field.children].filter(visible)) {
      if (getComputedStyle(child).position === 'absolute') continue
      if (child.getBoundingClientRect().bottom > rect.bottom + 2) {
        issues.push(`Content extends below its field: ${name(field)}`)
      }
    }
  }
  for (const control of [
    ...root.querySelectorAll('input, select, textarea'),
  ].filter(visible)) {
    const rect = control.getBoundingClientRect()
    const parent = control.parentElement.getBoundingClientRect()
    if (rect.left < parent.left - 2 || rect.right > parent.right + 2) {
      issues.push(
        `Control exceeds its container: ${control.id || control.name}`,
      )
    }
    if (
      innerWidth < 768 &&
      Number.parseFloat(getComputedStyle(control).fontSize) < 16
    ) {
      issues.push(
        `Editable control can trigger iOS focus zoom: ${control.id || control.name}`,
      )
    }
  }
  if (document.documentElement.scrollWidth > innerWidth + 1)
    issues.push('Page overflows horizontally')
  return { fields: fields.length, issues }
}

try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: mobile ? 375 : 1280, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
      colorScheme: mobile ? 'dark' : 'light',
    })
    for (const route of [
      'training',
      'forms',
      'horse-form',
      'stable-form',
      'style-lab',
    ]) {
      const page = await context.newPage()
      await page.goto(
        new URL(
          route === 'style-lab' ? '/style-lab' : `/page-lab/${route}`,
          baseURL,
        ).href,
        {
          waitUntil: 'domcontentloaded',
        },
      )
      const form = page.locator(
        route === 'style-lab'
          ? '[data-slot="form-control-specimen"]'
          : 'form[data-slot="route-form-card"]',
      )
      await form.waitFor({ timeout: 60_000 })
      await page.evaluate(() => document.fonts.ready)
      const check = async (state) => {
        const result = await form.evaluate(inspectLayout)
        assert.ok(
          result.fields > 0,
          'Expected production form fields in the fixture',
        )
        const entry = {
          route,
          mobile,
          width: page.viewportSize().width,
          state,
          ...result,
        }
        results.push(entry)
        if (result.issues.length) {
          await page.screenshot({
            path: `${output}/${route}-${mobile}-${entry.width}-${state}.png`,
            fullPage: true,
          })
        }
        assert.deepEqual(result.issues, [], JSON.stringify(entry))
      }
      for (const width of mobile ? [375, 320] : [1280, 768]) {
        await page.setViewportSize({ width, height: 900 })
        await check('collapsed')
        const closed = form.locator(
          '[data-slot="form-section"] > button[aria-expanded="false"]',
        )
        while (await closed.count()) await closed.first().click()
        await check('expanded')
        // Fill the real textareas: tests content growth as well as empty-state sizing.
        for (const textarea of await form.locator('textarea').all()) {
          if (await textarea.isVisible())
            await textarea.fill(
              'Ćwiczenia i uwagi — rhythm and transitions.\n'.repeat(8),
            )
        }
        await check('filled')
        // Older Safari ignores field-sizing: content; native textarea sizing must still work.
        await form.locator('textarea').evaluateAll((elements) =>
          elements.forEach((element) => {
            element.style.fieldSizing = 'fixed'
          }),
        )
        await check('native-textarea-fallback')
        await form.locator('textarea').evaluateAll((elements) =>
          elements.forEach((element) => {
            element.style.removeProperty('field-sizing')
          }),
        )
        const opened = form.locator(
          '[data-slot="form-section"] > button[aria-expanded="true"]',
        )
        while (await opened.count()) await opened.first().click()
      }
      console.log(
        `PASS ${route}: ${mobile ? 'mobile WebKit, dark' : 'desktop WebKit, light'}`,
      )
      await page.close()
    }
    await context.close()
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
  await browser.close()
}
console.log(`Passed ${results.length} WebKit form layout checks.`)
