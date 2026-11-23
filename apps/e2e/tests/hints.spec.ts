import { createPerson } from '../support/service'
import { expect, test } from '../support/test'

const wishlistNote = 'Twoją listę widzą osoby, które kupują Ci prezent'
const managersNote = 'Osoba zarządzająca widzi Twoją listę'

test('closed hints stay closed on this device until the menu brings them all back', async ({
  sessionOf,
}) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  const restore = page.getByRole('menuitem', { name: 'Przywróć ukryte wskazówki' })
  await page.getByRole('button', { name: 'Menu użytkownika' }).click()
  await expect(page.getByRole('menuitem', { name: 'Wyloguj' })).toBeVisible()
  await expect(restore).toBeHidden()
  await page.keyboard.press('Escape')

  await page.goto('/wishlist')
  await page.getByRole('button', { name: 'Ukryj wskazówkę' }).click()
  await expect(page.getByText(wishlistNote)).toBeHidden()
  await page.goto('/wishlist/managers')
  await page.getByRole('button', { name: 'Ukryj wskazówkę' }).click()
  await expect(page.getByText(managersNote)).toBeHidden()
  await page.goto('/wishlist')
  await expect(page.getByRole('heading', { name: 'Moja lista' })).toBeVisible()
  await expect(page.getByText(wishlistNote)).toBeHidden()

  const otherDevice = await sessionOf(anna)
  await otherDevice.goto('/wishlist')
  await expect(otherDevice.getByText(wishlistNote)).toBeVisible()

  await page.getByRole('button', { name: 'Menu użytkownika' }).click()
  await restore.click()
  await expect(page.getByText(wishlistNote)).toBeVisible()
  await page.goto('/wishlist/managers')
  await expect(page.getByText(managersNote)).toBeVisible()
  await page.getByRole('button', { name: 'Menu użytkownika' }).click()
  await expect(restore).toBeHidden()
})
