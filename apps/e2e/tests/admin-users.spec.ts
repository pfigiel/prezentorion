import type { Page } from '@playwright/test'
import { tokenOf } from '../support/api'
import { createDraw } from '../support/scenes'
import { addressOf, createPerson } from '../support/service'
import { expect, test } from '../support/test'

const rowOf = (page: Page, text: string) =>
  page.getByRole('main').getByRole('listitem').filter({ hasText: text })

test('the admin finds people and the addresses still waiting for them', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const invited = addressOf('dawid')
  await createDraw(admin, [admin, anna, invited])

  const page = await sessionOf(admin)
  await page.goto('/admin/users')

  await page.getByLabel('Szukaj').fill(anna.email)
  await expect(page.getByText('Użytkownicy: 1')).toBeVisible()
  await expect(rowOf(page, anna.name)).toContainText('e-mail i hasło')
  await expect(rowOf(page, anna.name)).toContainText('losowania: 1')

  await page.getByLabel('Szukaj').fill(invited)
  await expect(rowOf(page, invited)).toContainText('Oczekuje na pierwsze logowanie')
  await expect(rowOf(page, invited).getByRole('button', { name: 'Nowe hasło' })).toBeHidden()

  await page.getByLabel('Szukaj').fill(admin.email)
  await expect(rowOf(page, admin.name)).toContainText('Admin')
  await expect(rowOf(page, admin.name)).toContainText('Google i e-mail')
})

test('the admin sets a temporary password the person signs in with', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')

  const page = await sessionOf(admin)
  await page.goto('/admin/users')
  await page.getByLabel('Szukaj').fill(anna.email)
  await rowOf(page, anna.name).getByRole('button', { name: 'Nowe hasło' }).click()

  const dialog = page.getByRole('dialog', { name: `Nowe hasło dla ${anna.name}` })
  const field = dialog.getByLabel('Hasło tymczasowe')
  await field.fill('abc')
  await field.press('Enter')
  await expect(dialog.getByText('Hasło musi mieć co najmniej 8 znaków.')).toBeVisible()

  await field.fill('tymczasowe1')
  await field.press('Enter')
  await expect(dialog.getByText('Hasło zmienione.')).toBeVisible()
  await dialog.getByRole('button', { name: 'Gotowe' }).click()
  await expect(dialog).toBeHidden()

  await expect(tokenOf({ email: anna.email, password: 'tymczasowe1' })).resolves.toBeTruthy()
  await expect(tokenOf(anna)).rejects.toThrow()
})
