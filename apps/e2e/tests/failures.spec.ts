import { createPerson } from '../support/service'
import { expect, test } from '../support/test'

test('a save the API fails is announced in a toast, and the form keeps what was typed', async ({
  sessionOf,
}) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna)
  await page.route('**/api/wishlist', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 500, json: { error: 'Internal Server Error' } })
      : route.continue(),
  )

  await page.goto('/wishlist/new')
  await page.getByLabel('Nazwa').fill('Kubek')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const toast = page.getByRole('alert').filter({ hasText: 'Coś poszło nie tak. Spróbuj ponownie.' })
  await expect(toast).toBeVisible()
  await expect(page).toHaveURL(/\/wishlist\/new$/)
  await expect(page.getByLabel('Nazwa')).toHaveValue('Kubek')

  await toast.getByRole('button', { name: 'Zamknij' }).click()
  await expect(toast).toBeHidden()
})

test('a toast lines up with the content and is swiped away sideways', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')
  const page = await sessionOf(anna)
  await page.route('**/api/wishlist', (route) =>
    route.request().method() === 'POST' ? route.fulfill({ status: 500 }) : route.continue(),
  )

  await page.goto('/wishlist/new')
  const name = page.getByLabel('Nazwa')
  await name.fill('Kubek')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const toast = page.getByRole('alert').filter({ hasText: 'Coś poszło nie tak. Spróbuj ponownie.' })
  await expect(toast).toBeVisible()
  const [toastBox, fieldBox] = await Promise.all([toast.boundingBox(), name.boundingBox()])
  expect(toastBox?.x).toBeCloseTo(fieldBox?.x ?? Number.NaN, 0)
  expect(toastBox?.width).toBeCloseTo(fieldBox?.width ?? Number.NaN, 0)

  const box = toastBox ?? { x: 0, y: 0, width: 0, height: 0 }
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + 20, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width, y, { steps: 10 })
  await page.mouse.up()
  await expect(toast).toBeHidden()
})
