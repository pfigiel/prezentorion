import type { Page } from '@playwright/test'
import { expect, test } from '../support/test'

test('an unknown path shows a way back', async ({ page }) => {
  await page.goto('/no-such-page')

  await expect(page.getByText('Nie ma takiej strony.')).toBeVisible()
  await page.getByRole('link', { name: 'Wróć na start' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('the privacy policy opens from the sign-in screen and leads back', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Polityka prywatności' }).click()

  await expect(page.getByRole('heading', { name: 'Polityka prywatności' })).toBeVisible()
  await page.getByRole('link', { name: 'Wróć' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

const columnOf = (page: Page) =>
  page.locator('main').evaluate((main) => {
    const column = main.parentElement as HTMLElement
    const style = getComputedStyle(column)

    return {
      width: column.getBoundingClientRect().width,
      window: document.documentElement.clientWidth,
      border: style.borderLeftWidth,
    }
  })

test('the column fills a phone and is framed on anything wider', async ({ page }) => {
  await page.goto('/login')

  await page.setViewportSize({ width: 430, height: 900 })
  const onPhone = await columnOf(page)
  expect(onPhone.width).toBe(onPhone.window)
  expect(onPhone.border).toBe('0px')

  // Just past the column's width: the gap where it used to stand unframed.
  await page.setViewportSize({ width: 500, height: 900 })
  const justWider = await columnOf(page)
  expect(justWider.width).toBeLessThan(justWider.window)
  expect(justWider.border).toBe('1px')
})

test('every iPhone splash screen exists at the exact size iOS asks for', async ({ page }) => {
  await page.goto('/login')

  const splashes = await page
    .locator('link[rel="apple-touch-startup-image"]')
    .evaluateAll((links) =>
      links.map((link) => ({
        href: (link as HTMLLinkElement).href,
        media: (link as HTMLLinkElement).media,
      })),
    )
  expect(splashes.length).toBeGreaterThan(0)

  for (const { href, media } of splashes) {
    const screen = /device-width: (\d+)px.*device-height: (\d+)px.*pixel-ratio: (\d+)/.exec(media)
    expect(screen, href).not.toBeNull()
    const [width, height, ratio] = (screen ?? []).slice(1).map(Number) as [number, number, number]
    const size = await page.evaluate(async (src) => {
      const image = new Image()
      image.src = src
      await image.decode()

      return [image.naturalWidth, image.naturalHeight]
    }, href)

    expect(size, href).toEqual([width * ratio, height * ratio])
  }
})
