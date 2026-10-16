import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

// Disposable local fixture: never signs out or edits a real account.
const baseURL = new URL(
  process.env.NAVIGATION_TEST_URL ?? 'http://localhost:9090',
)
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(baseURL.hostname))
await mkdir('.browser-checks/drawer', { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (const scenario of [
    { width: 390, height: 844, locale: 'en', theme: 'light' },
    { width: 800, height: 900, locale: 'en', theme: 'dark' },
    { width: 1280, height: 800, locale: 'en', theme: 'light' },
    { width: 320, height: 568, locale: 'pl', theme: 'dark' },
    { width: 812, height: 390, locale: 'en', theme: 'light' },
  ]) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
    })
    await context.addInitScript(({ locale, theme }) => {
      localStorage.setItem('paddockPilot.guestLocale', locale)
      localStorage.setItem('theme', theme)
      localStorage.setItem('paddockPilot.sidebarCollapsed', 'true')
    }, scenario)
    const page = await context.newPage()
    await page.goto(new URL('/page-lab/navigation', baseURL).href)
    const open = page.getByRole('button', {
      name: /^(Open navigation menu|Otwórz menu nawigacji)$/,
    })
    await open.waitFor({ timeout: 60000 })
    await open.click()
    const drawer = page.locator('[data-slot="workspace-drawer"]')
    await drawer.waitFor()
    await page.evaluate(() => document.fonts.ready)
    const close = drawer.getByRole('button', {
      name: /^(Close navigation menu|Zamknij menu nawigacji)$/,
    })
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-slot=workspace-drawer]')
      return (
        el &&
        !el.hasAttribute('data-starting-style') &&
        el.getAnimations().length === 0
      )
    })
    const initialClose = await close.boundingBox()
    assert.ok(initialClose.width >= 44 && initialClose.height >= 44)
    await close.focus()
    await page.keyboard.press('Shift+Tab')
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-slot=workspace-drawer]')
          ?.contains(document.activeElement),
      null,
      { timeout: 3000 },
    )
    const scroller = drawer.locator('[data-slot="workspace-drawer-scroll"]')
    await scroller.evaluate((el) => (el.scrollTop = 0))
    await page.screenshot({
      path: `.browser-checks/drawer/${scenario.width}-top.png`,
    })
    const picker = drawer.getByRole('button', {
      name: /^(Current workspace:|Obecna przestrzeń:)/,
    })
    await picker.click()
    const menu = page.getByRole('menu')
    await menu.waitFor()
    const menuBounds = await menu.boundingBox()
    assert.ok(
      menuBounds.y >= -1 &&
        menuBounds.y + menuBounds.height <= scenario.height + 1,
      'Workspace menu fits viewport',
    )
    await page.keyboard.press('Escape')
    await menu.waitFor({ state: 'hidden' })
    assert.equal(
      await picker.evaluate((el) => document.activeElement === el),
      true,
    )
    await scroller.evaluate((el) => (el.scrollTop = el.scrollHeight))
    assert.equal(
      (await close.boundingBox()).y,
      initialClose.y,
      'Close stays reachable while scrolling',
    )
    const signout = drawer.getByRole('button', {
      name: /^(Sign out|Wyloguj się)$/,
    })
    await signout.click()
    await drawer.getByRole('alert').waitFor()
    await signout.scrollIntoViewIfNeeded()
    const metrics = await drawer.evaluate((el) => {
      const sc = el.querySelector('[data-slot="workspace-drawer-scroll"]')
      const bounds = el.getBoundingClientRect()
      const nav = el
        .querySelector('.app-workspace-links')
        .getBoundingClientRect()
      const account = el
        .querySelector('.app-workspace-account')
        .getBoundingClientRect()
      return {
        overlap: nav.bottom - account.top,
        width: bounds.width,
        scrollHeight: sc.scrollHeight,
        scrollClientHeight: sc.clientHeight,
        horizontalOverflow: sc.scrollWidth - sc.clientWidth,
        closeButtons: [...el.querySelectorAll('button')].filter((b) =>
          /Close navigation menu|Zamknij menu nawigacji/.test(
            b.getAttribute('aria-label') ?? '',
          ),
        ).length,
        minTarget: Math.min(
          ...[...el.querySelectorAll('a,button')]
            .filter((b) => b.getClientRects().length)
            .map((b) => b.getBoundingClientRect().height),
        ),
      }
    })
    assert.equal(metrics.closeButtons, 1)
    assert.ok(metrics.horizontalOverflow <= 1, JSON.stringify(metrics))
    assert.ok(metrics.minTarget >= 43.9, JSON.stringify(metrics))
    assert.ok(metrics.overlap <= 0, JSON.stringify(metrics))
    await page.screenshot({
      path: `.browser-checks/drawer/${scenario.width}-account.png`,
    })
    const preferences = drawer.getByRole('button', {
      name: /^(Preferences|Preferencje)$/,
    })
    await preferences.click()
    const prefs = page.getByRole('dialog', {
      name: /^(Preferences|Preferencje)$/,
    })
    await prefs.waitFor()
    assert.equal(
      await drawer.count(),
      0,
      'Drawer gone before preferences opens',
    )
    await page.keyboard.press('Escape')
    await prefs.waitFor({ state: 'hidden' })
    assert.equal(
      await open.evaluate((el) => document.activeElement === el),
      true,
      'Preferences returns focus to menu opener',
    )
    await open.click()
    await close.click()
    await drawer.waitFor({ state: 'hidden' })
    assert.equal(
      await open.evaluate((el) => document.activeElement === el),
      true,
    )
    results.push({ scenario, metrics })
    console.log(JSON.stringify(results.at(-1)))
    await context.close()
  }
} finally {
  await browser.close()
}
