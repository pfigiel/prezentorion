import type { Page } from '@playwright/test'
import { createPerson } from '../support/service'
import { expect, test } from '../support/test'

/** Holds every request to `path` until the returned function lets them through. */
const holdRequests = async (page: Page, path: string) => {
  let release = () => {}
  const released = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.route(path, async (route) => {
    await released
    await route.continue()
  })

  return release
}

test('the splash stays up until the first screen has loaded', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna)
  const release = await holdRequests(page, '**/api/account')

  await page.reload()
  const splash = page.locator('#splash')
  await expect(splash).toBeVisible()
  await expect(splash).toHaveAttribute('aria-label', 'Wczytywanie')

  release()
  await expect(page.getByRole('heading', { name: `Cześć, ${anna.name}!` })).toBeVisible()
  await expect(splash).toHaveCount(0)
})

test('a screen still loading its data shows a loader', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna)
  await page.goto('/wishlist')
  const release = await holdRequests(page, '**/api/managers')

  await page.getByRole('link', { name: 'Kto zarządza moją listą' }).click()
  const loader = page.getByRole('progressbar', { name: 'Wczytywanie' })
  await expect(loader).toBeVisible()

  release()
  await expect(page.getByRole('heading', { name: 'Zarządzanie listą' })).toBeVisible()
  await expect(loader).toBeHidden()
})
