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
