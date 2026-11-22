import type { Page } from '@playwright/test'
import { callAs } from '../support/api'
import { addItem, assignmentsOf, buy, createDraw, reveal } from '../support/scenes'
import { addressOf, createPerson, drawNameOf, warsawDateOf } from '../support/service'
import { expect, test } from '../support/test'

const panelOf = async (page: Page, drawId: string) => {
  await page.goto(`/admin/draws/${drawId}`)
  await expect(page.getByRole('link', { name: 'Edytuj' })).toBeVisible()
}

const rowOf = (page: Page, name: string) =>
  page.getByRole('main').getByRole('listitem').filter({ hasText: name })

test('a new draw is checked, saved as a draft and cannot run alone', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const name = drawNameOf('Nowe')

  const page = await sessionOf(admin)
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Nowe losowanie' }).click()
  await page.getByLabel('Nazwa').fill(name)
  await page.getByLabel('Data imprezy').fill('2026-12-20')
  await page.getByLabel('Budżet (zł)').fill('100,50')
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByText('Wpisz kwotę w pełnych złotych.')).toBeVisible()

  await page.getByLabel('Budżet (zł)').fill('100')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.getByText('Szkic')).toBeVisible()
  await expect(page.getByText('Do losowania potrzeba co najmniej dwóch uczestników.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Uruchom losowanie' })).toBeDisabled()
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(0)
})

test('participants are found, invited by address, and drawn', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const invited = addressOf('ewa')
  const draw = await createDraw(admin, [])

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  const search = page.getByLabel('Dodaj uczestnika')
  await search.fill(anna.email)
  await expect(page.getByRole('option', { name: anna.name })).toBeVisible()
  await search.press('Enter')
  await search.fill(invited.toUpperCase())
  await expect(page.getByRole('option', { name: `Zaproś ${invited}` })).toBeVisible()
  await search.press('Enter')
  await search.press('Escape')
  await expect(rowOf(page, invited)).toContainText('Oczekuje na pierwsze logowanie')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(rowOf(page, anna.name)).toBeVisible()
  await expect(rowOf(page, invited)).toBeVisible()
  await page.getByRole('button', { name: 'Uruchom losowanie' }).click()

  await expect(page.getByText('Odkryte wyniki')).toBeVisible()
  await expect(page.getByText('0/2')).toBeVisible()
  expect(await assignmentsOf(admin, draw)).toHaveLength(2)
})

test('drawing again makes everyone reveal anew', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna], { drawn: true })
  await reveal(anna, draw)

  const page = await sessionOf(admin)
  await panelOf(page, draw.id)
  await expect(rowOf(page, anna.name)).toContainText('Odkryte')
  await page.getByRole('button', { name: 'Losuj ponownie' }).click()
  await page
    .getByRole('dialog', { name: 'Losować ponownie?' })
    .getByRole('button', { name: 'Losuj ponownie' })
    .click()

  await expect(rowOf(page, anna.name)).toContainText('Nieodkryte')
})

test('editing details keeps the draw, changing who takes part draws it again', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  const draw = await createDraw(admin, [admin, anna, bartek], { drawn: true })
  const before = await assignmentsOf(admin, draw)

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  await page.getByLabel('Nazwa').fill(drawNameOf('Wigilia rodzinna'))
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByRole('link', { name: 'Edytuj' })).toBeVisible()
  expect(await assignmentsOf(admin, draw)).toEqual(before)

  await page.getByRole('link', { name: 'Edytuj' }).click()
  await page.getByRole('button', { name: `Usuń ${bartek.name}` }).click()
  await page.getByLabel('Dodaj uczestnika').fill(celina.email)
  await page.getByLabel('Dodaj uczestnika').press('Enter')
  await page.getByLabel('Dodaj uczestnika').press('Escape')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const dialog = page.getByRole('dialog', { name: 'Losowanie od nowa' })
  const confirm = dialog.getByRole('button', { name: 'Zapisz i losuj ponownie' })
  const clipped = await confirm.evaluate((button) => button.scrollWidth > button.clientWidth)
  expect(clipped).toBe(false)
  await confirm.click()

  await expect(rowOf(page, celina.name)).toBeVisible()
  expect((await callAs(bartek, 'GET', `/draws/${draw.id}`)).status).toBe(404)
  expect((await callAs(celina, 'GET', `/draws/${draw.id}`)).status).toBe(200)
})

test('a drawn draw cannot be left with fewer than two participants', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna], { drawn: true })

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  await page.getByRole('button', { name: `Usuń ${anna.name}` }).click()
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(
    page.getByText('Wylosowane losowanie potrzebuje co najmniej dwóch uczestników.'),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('the admin finishes a draw early, and owners see what was bought', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const bartek = await createPerson('Bartek')
  const itemId = await addItem(owner, 'Rower')
  const draw = await createDraw(admin, [owner, bartek], { drawn: true })
  await reveal(bartek, draw)
  await buy(bartek, draw, itemId)

  const page = await sessionOf(admin)
  await panelOf(page, draw.id)
  await page.getByRole('button', { name: 'Zakończ losowanie' }).click()
  await page
    .getByRole('dialog', { name: 'Zakończyć losowanie teraz?' })
    .getByRole('button', { name: 'Zakończ' })
    .click()

  const [year, month, day] = warsawDateOf().split('-')
  await expect(page.getByText('Zakończone')).toBeVisible()
  await expect(page.getByText(`${day}.${month}.${year}`)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zakończ losowanie' })).toBeHidden()

  const ownerPage = await sessionOf(owner)
  await ownerPage.goto('/wishlist')
  await expect(
    ownerPage.getByRole('article').filter({ hasText: 'Rower' }).getByText('Kupione'),
  ).toBeVisible()

  const bartekPage = await sessionOf(bartek)
  const card = bartekPage.locator('[data-surface]').filter({ hasText: draw.name })
  await expect(card.getByText('Zakończone')).toBeVisible()
})

test('the admin can look at who buys for whom, after a warning', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna], { drawn: true })

  const page = await sessionOf(admin)
  await panelOf(page, draw.id)
  await page.getByRole('button', { name: 'Pokaż przydziały…' }).click()
  await page
    .getByRole('dialog', { name: 'Pokazać przydziały?' })
    .getByRole('button', { name: 'Pokaż' })
    .click()

  await expect(page.getByRole('heading', { name: 'Przydziały' })).toBeVisible()
  await expect(rowOf(page, `${admin.name}`)).toHaveCount(2)
  await expect(rowOf(page, anna.name).first()).toBeVisible()
  await page.getByRole('button', { name: 'Ukryj przydziały' }).click()
  await expect(page).toHaveURL(new RegExp(`/admin/draws/${draw.id}$`))
})

test('the admin deletes a draw in any state', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draft = await createDraw(admin, [admin, anna])
  const drawn = await createDraw(admin, [admin, anna], { drawn: true })
  await reveal(anna, drawn)

  const page = await sessionOf(admin)
  await panelOf(page, draft.id)
  await page.getByRole('button', { name: 'Usuń losowanie' }).click()
  await page
    .getByRole('dialog', { name: 'Usunąć losowanie?' })
    .getByRole('button', { name: 'Anuluj' })
    .click()
  await expect(page.getByRole('heading', { name: draft.name })).toBeVisible()

  for (const draw of [draft, drawn]) {
    await panelOf(page, draw.id)
    await page.getByRole('button', { name: 'Usuń losowanie' }).click()
    await page
      .getByRole('dialog', { name: 'Usunąć losowanie?' })
      .getByRole('button', { name: 'Usuń' })
      .click()
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('link', { name: draw.name })).toBeHidden()
    expect((await callAs(anna, 'GET', `/draws/${draw.id}`)).status).toBe(404)
  }
})
