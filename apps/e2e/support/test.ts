import {
  test as base,
  devices,
  expect,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test'
import type { Person } from './service'
import { appUrl } from './stack'

/** The app is mobile-first; every session sees it on a phone. */
export const phone = { ...devices['Pixel 7'], baseURL: appUrl }

export const signIn = async (page: Page, person: Person) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(person.email)
  await page.getByLabel('Hasło').fill(person.password)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await expect(page.getByRole('heading', { name: `Cześć, ${person.name}!` })).toBeVisible()
}

type Fixtures = {
  /** A signed-in page of this person's own, in a browser context nobody else shares; a phone unless told. */
  sessionOf: (person: Person, device?: BrowserContextOptions) => Promise<Page>
}

export const test = base.extend<Fixtures>({
  sessionOf: async ({ browser }, use) => {
    const contexts: BrowserContext[] = []

    await use(async (person, device = phone) => {
      const context = await browser.newContext({ ...device, baseURL: appUrl })
      contexts.push(context)
      const page = await context.newPage()
      await signIn(page, person)

      return page
    })

    await Promise.all(contexts.map((context) => context.close()))
  },
})

export { expect }
