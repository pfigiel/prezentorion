import { devices, type BrowserContextOptions, type Page } from '@playwright/test'
import { apiAs } from '../support/api'
import { createPerson, type Person } from '../support/service'
import { expect, test } from '../support/test'

const iPhone = devices['iPhone 15']
const iPhoneApp = {
  ...iPhone,
  userAgent: iPhone.userAgent.replace(/ Safari\/\S+$/, ' Instagram 300.0.0.0'),
} satisfies BrowserContextOptions

const promptOf = (page: Page) => page.getByRole('dialog', { name: 'Zainstaluj Prezentorion' })

/** What Chromium fires once the app can be installed, with a dialog that answers `outcome`. */
const offerInstall = (page: Page, outcome: 'accepted' | 'dismissed' = 'accepted') =>
  page.evaluate((outcome) => {
    const event = new Event('beforeinstallprompt', { cancelable: true })

    window.dispatchEvent(
      Object.assign(event, {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome, platform: 'web' }),
      }),
    )
  }, outcome)

// The prompt opens on the next render; a frame or two is how long its absence has to hold.
const afterRender = (page: Page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )

const settledOf = async (person: Person) =>
  (await apiAs<{ installPromptSettled: boolean }>(person, 'GET', '/account')).installPromptSettled

test('an Android phone installs through the browser dialog and is not asked again', async ({
  sessionOf,
}) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna)

  await offerInstall(page)
  await promptOf(page).getByRole('button', { name: 'Zainstaluj' }).click()
  await expect(promptOf(page)).toBeHidden()
  await expect.poll(() => settledOf(anna)).toBe(true)

  await page.reload()
  await offerInstall(page)
  await afterRender(page)
  await expect(promptOf(page)).toBeHidden()
})

test('closing the prompt brings it back on the next load, declining keeps it away everywhere', async ({
  sessionOf,
}) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna, iPhoneApp)

  await expect(promptOf(page)).toContainText('Otwórz tę stronę w Safari')
  await promptOf(page).getByRole('button', { name: 'Rozumiem' }).click()
  await expect(promptOf(page)).toBeHidden()

  await page.reload()
  await promptOf(page).getByRole('button', { name: 'Nie, dziękuję' }).click()
  await expect(promptOf(page)).toBeHidden()
  await expect.poll(() => settledOf(anna)).toBe(true)

  const safari = await sessionOf(anna, iPhone)
  await afterRender(safari)
  await expect(promptOf(safari)).toBeHidden()
  const android = await sessionOf(anna)
  await offerInstall(android)
  await afterRender(android)
  await expect(promptOf(android)).toBeHidden()
})

test('Safari on an iPhone explains how to add the app to the home screen', async ({
  sessionOf,
}) => {
  const page = await sessionOf(await createPerson('Anna'), iPhone)

  await expect(promptOf(page)).toContainText('Do ekranu początkowego')
})

test('opening the app from the home screen stops the prompt in the browser too', async ({
  sessionOf,
}) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna, iPhone)

  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }))
  await page.reload()
  await expect(page.getByRole('heading', { name: `Cześć, ${anna.name}!` })).toBeVisible()
  await afterRender(page)
  await expect(promptOf(page)).toBeHidden()
  await expect.poll(() => settledOf(anna)).toBe(true)
})

for (const [name, device] of [
  ['a desktop', devices['Desktop Chrome']],
  ['an iPad', devices['iPad Pro 11']],
] as const) {
  test(`${name} is never asked to install`, async ({ sessionOf }) => {
    const page = await sessionOf(await createPerson('Anna'), device)

    await offerInstall(page)
    await afterRender(page)
    await expect(promptOf(page)).toBeHidden()
  })
}
