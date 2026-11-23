import { readFile } from 'node:fs/promises'
import type { Page } from '@playwright/test'
import { apiAs, callAs, storageAs } from '../support/api'
import { addItem, assignmentsOf, buy, createDraw, participantOf, reveal } from '../support/scenes'
import { addressOf, createPerson, drawNameOf } from '../support/service'
import { expect, test } from '../support/test'

const photo = new URL('../fixtures/gift.png', import.meta.url).pathname

const rowOf = (page: Page, name: string) =>
  page.getByRole('main').getByRole('listitem').filter({ hasText: name })

test('the admin sets up an open draw, which starts without drawing anybody', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const name = drawNameOf('Mikołajki')

  const page = await sessionOf(admin)
  await page.goto('/admin/draws/new')
  await page.getByLabel('Nazwa').fill(name)
  await page.getByLabel('Data imprezy').fill('2026-12-06')
  await expect(page.getByRole('radio', { name: /Każdy losuje jedną osobę/ })).toBeChecked()
  await page.getByRole('radio', { name: /Każdy obdarowuje każdego/ }).click()
  await expect(page.getByRole('button', { name: 'Wykluczenia' })).toBeHidden()
  await page.getByRole('button', { name: 'Dalej' }).click()
  const search = page.getByLabel('Dodaj uczestnika')
  for (const person of [admin, anna]) {
    await search.fill(person.email)
    await search.press('Enter')
  }
  await search.press('Escape')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.getByText('Każdy obdarowuje każdego')).toBeVisible()
  await page.getByRole('button', { name: 'Rozpocznij losowanie' }).click()

  await expect(page.getByText(/^Rozpoczęte/)).toBeVisible()
  await expect(page.getByText('Odkryte wyniki')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Losuj ponownie' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Pokaż przydziały…' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Zakończ losowanie' })).toBeVisible()
  const drawId = page.url().split('/').at(-1) ?? ''
  expect(await assignmentsOf(admin, { id: drawId, name })).toEqual([])

  await page.getByRole('link', { name: 'Edytuj' }).click()
  await expect(page.getByRole('radio', { name: /Każdy obdarowuje każdego/ })).toBeDisabled()
  await expect(page.getByText('Trybu nie można zmienić po rozpoczęciu losowania.')).toBeVisible()
  const switched = await callAs(admin, 'PUT', `/admin/draws/${drawId}`, {
    name,
    eventDate: '2026-12-06',
    budget: null,
    mode: 'secret',
    emails: [admin.email, anna.email],
    excludedPairs: [],
  })
  expect(switched.status).toBe(400)
})

test('before an open draw starts, participants wait to see each other’s lists', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna], { mode: 'open' })
  await addItem(admin, 'Zegarek')

  const page = await sessionOf(anna)
  await expect(page.getByText('Czeka na start')).toBeVisible()
  await page.getByRole('link', { name: 'Szczegóły' }).click()
  await expect(page.getByText('Gdy administrator rozpocznie losowanie')).toBeVisible()
  await expect(page.getByRole('link', { name: admin.name })).toBeHidden()

  const adminId = await participantOf(anna, draw, admin)
  expect(await apiAs(anna, 'GET', `/draws/${draw.id}/participants/${adminId}/wishlist`)).toEqual([])
})

test('in an open draw everyone browses everyone else’s list and marks purchases', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  await addItem(bartek, 'Rower', { price: 100, priority: 3 })
  await addItem(bartek, 'Jacht', { price: 151 })
  await addItem(celina, 'Szalik')
  const draw = await createDraw(admin, [anna, bartek, celina], {
    mode: 'open',
    budget: 150,
    drawn: true,
  })

  const page = await sessionOf(anna)
  const card = page.locator('[data-surface]').filter({ hasText: draw.name })
  await expect(card.getByText('Trwa')).toBeVisible()
  await card.getByRole('link', { name: 'Zobacz listy prezentów' }).click()

  await expect(page.getByText('W tym losowaniu każdy może obdarować każdego')).toBeVisible()
  await expect(page.getByRole('button', { name: /Dotknij, aby odkryć/ })).toBeHidden()
  await expect(rowOf(page, anna.name)).toContainText('Ty')
  await expect(rowOf(page, anna.name).getByRole('link')).toHaveCount(0)
  await page.getByRole('link', { name: celina.name }).click()
  await expect(page.getByRole('heading', { name: celina.name })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Szalik' })).toBeVisible()

  await page.getByRole('link', { name: 'Wstecz' }).click()
  await page.getByRole('link', { name: bartek.name }).click()
  await expect(page.getByText('Budżet na prezent: 150 zł')).toBeVisible()
  await expect(page.getByText('Lista prezentów · 1')).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Jacht' })).toBeHidden()
  const bike = page.getByRole('article').filter({ hasText: 'Rower' })
  await bike.getByRole('switch').click()
  await expect(bike.getByText('Kupione przeze mnie')).toBeVisible()
  await expect(page.getByText('Lista prezentów · 0')).toBeVisible()
  await page.reload()
  await expect(bike.getByRole('switch')).toBeChecked()

  const celinaPage = await sessionOf(celina)
  await celinaPage.goto(`/draws/${draw.id}`)
  await celinaPage.getByRole('link', { name: bartek.name }).click()
  const celinaBike = celinaPage.getByRole('article').filter({ hasText: 'Rower' })
  await expect(celinaBike).toContainText('Kupione przez inną osobę')
  await expect(celinaBike.getByRole('switch')).toBeHidden()

  const bartekPage = await sessionOf(bartek)
  await bartekPage.goto('/wishlist')
  await expect(
    bartekPage.getByRole('article').filter({ hasText: 'Rower' }).getByText('Kupione'),
  ).toBeHidden()
})

test('someone added to an open draw already running joins without undoing purchases', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const dawid = await createPerson('Dawid')
  const itemId = await addItem(bartek, 'Rower')
  const draw = await createDraw(admin, [anna, bartek], { mode: 'open', drawn: true })
  const bartekId = await participantOf(anna, draw, bartek)
  await apiAs(anna, 'PUT', `/draws/${draw.id}/participants/${bartekId}/purchases/${itemId}`, {
    purchased: true,
  })

  const page = await sessionOf(admin)
  await page.goto(`/admin/draws/${draw.id}/edit`)
  await page.getByRole('button', { name: 'Uczestnicy' }).click()
  await page.getByLabel('Dodaj uczestnika').fill(dawid.email)
  await page.getByLabel('Dodaj uczestnika').press('Enter')
  await page.getByLabel('Dodaj uczestnika').press('Escape')
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(rowOf(page, dawid.name)).toBeVisible()

  const dawidPage = await sessionOf(dawid)
  await dawidPage.goto(`/draws/${draw.id}`)
  await dawidPage.getByRole('link', { name: bartek.name }).click()
  await expect(dawidPage.getByRole('article').filter({ hasText: 'Rower' })).toContainText(
    'Kupione przez inną osobę',
  )
})

test('an open draw’s lists and photos stay out of reach of anyone else', async () => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const outsider = await createPerson('Celina')
  const itemId = await addItem(bartek, 'Rower')
  const photoPath = `${bartek.id}/${crypto.randomUUID()}.png`
  const upload = await storageAs(bartek, `wish-photos/${photoPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: await readFile(photo),
  })
  expect(upload.ok).toBe(true)
  const open = await createDraw(admin, [anna, bartek, addressOf('ewa')], { mode: 'open' })
  const bartekId = await participantOf(anna, open, bartek)
  const wishlistPath = `/draws/${open.id}/participants/${bartekId}/wishlist`
  const purchasePath = `/draws/${open.id}/participants/${bartekId}/purchases/${itemId}`
  const photoOf = (person: typeof anna) =>
    storageAs(person, `authenticated/wish-photos/${photoPath}`)

  expect((await photoOf(anna)).ok).toBe(false)
  expect((await callAs(anna, 'PUT', purchasePath, { purchased: true })).status).toBe(403)

  await apiAs(admin, 'POST', `/admin/draws/${open.id}/run`)
  expect((await callAs(admin, 'POST', `/admin/draws/${open.id}/run`)).status).toBe(400)
  expect(await apiAs<unknown[]>(anna, 'GET', wishlistPath)).toHaveLength(1)
  expect((await photoOf(anna)).ok).toBe(true)

  expect(await apiAs(outsider, 'GET', wishlistPath)).toEqual([])
  expect((await callAs(outsider, 'PUT', purchasePath, { purchased: true })).status).toBe(403)
  expect((await photoOf(outsider)).ok).toBe(false)
  expect((await callAs(anna, 'POST', `/draws/${open.id}/reveal`)).status).toBe(404)

  // The paths of an open draw lead nowhere in a secret one, where Anna buys only for her recipient.
  const secret = await createDraw(admin, [anna, bartek], { drawn: true })
  await reveal(anna, secret)
  const secretBartekId = await participantOf(anna, secret, bartek)
  const secretPath = `/draws/${secret.id}/participants/${secretBartekId}`
  expect(await apiAs(anna, 'GET', `${secretPath}/wishlist`)).toEqual([])
  expect(
    (await callAs(anna, 'PUT', `${secretPath}/purchases/${itemId}`, { purchased: true })).status,
  ).toBe(403)
  await buy(anna, secret, itemId)
})
