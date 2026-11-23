import type { Page } from '@playwright/test'
import { assignmentsOf, createDraw } from '../support/scenes'
import { createPerson, type Person } from '../support/service'
import { expect, test } from '../support/test'

const stepOf = (page: Page, name: string) => page.getByRole('button', { name })

const pick = async (page: Page, pair: number, side: 'pierwsza' | 'druga', person: Person) => {
  await page.getByRole('combobox', { name: `Para ${pair} – ${side} osoba` }).fill(person.name)
  await page.getByRole('option', { name: person.name }).click()
}

test('paired participants never draw each other', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  const draw = await createDraw(admin, [admin, anna, bartek, celina])

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  await stepOf(page, 'Wykluczenia').click()
  await pick(page, 1, 'pierwsza', anna)
  await pick(page, 1, 'druga', bartek)
  await page.getByRole('button', { name: 'Dodaj parę' }).click()
  await pick(page, 2, 'pierwsza', celina)
  await pick(page, 2, 'druga', admin)
  await page.getByRole('button', { name: 'Dodaj parę' }).click()
  await pick(page, 3, 'pierwsza', anna)
  await pick(page, 3, 'druga', celina)
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await page.getByRole('button', { name: 'Uruchom losowanie' }).click()
  await expect(page.getByText('Odkryte wyniki')).toBeVisible()

  // These three pairs leave exactly one way to draw.
  const recipientOf = new Map(
    (await assignmentsOf(admin, draw)).map(({ giver, recipient }) => [
      giver.email,
      recipient.email,
    ]),
  )
  expect(Object.fromEntries(recipientOf)).toEqual({
    [anna.email]: admin.email,
    [admin.email]: anna.email,
    [bartek.email]: celina.email,
    [celina.email]: bartek.email,
  })

  await page.getByRole('link', { name: 'Edytuj' }).click()
  await stepOf(page, 'Wykluczenia').click()
  await expect(page.getByRole('group', { name: /^Para \d$/ })).toHaveCount(3)
  await page.getByRole('button', { name: 'Usuń parę 3' }).click()
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByRole('dialog', { name: 'Losowanie od nowa' })).toBeVisible()
})

test('a half-filled pair, or pairs that leave no draw, are not saved', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const draw = await createDraw(admin, [admin, anna, bartek], { excludedPairs: [[admin, bartek]] })

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  await stepOf(page, 'Wykluczenia').click()
  const impossible = page.getByText('Przy tych parach nie da się nikogo wylosować', {
    exact: false,
  })
  await expect(impossible).toBeVisible()
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page).toHaveURL(/\/edit$/)

  await page.getByRole('button', { name: 'Usuń parę 1' }).click()
  await expect(impossible).toBeHidden()
  await page.getByRole('button', { name: 'Dodaj parę' }).click()
  await pick(page, 1, 'pierwsza', anna)
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByText('Wybierz drugą osobę albo usuń parę.')).toBeVisible()

  await stepOf(page, 'Uczestnicy').click()
  await page.getByRole('button', { name: `Usuń ${anna.name}` }).click()
  await stepOf(page, 'Wykluczenia').click()
  await expect(page.getByRole('combobox', { name: 'Para 1 – pierwsza osoba' })).toBeHidden()
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByRole('link', { name: 'Edytuj' })).toBeVisible()
})
