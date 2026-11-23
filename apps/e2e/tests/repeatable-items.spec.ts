import { apiAs, callAs } from '../support/api'
import { addItem, addManager, buy, createDraw, participantOf, reveal } from '../support/scenes'
import { createPerson, setEventDate, warsawDateOf, type Person } from '../support/service'
import { expect, test } from '../support/test'

const buyOpen = async (giver: Person, drawId: string, ownerId: string, itemId: string) =>
  apiAs(giver, 'PUT', `/draws/${drawId}/participants/${ownerId}/purchases/${itemId}`, {
    purchased: true,
  })

test('an owner marks an item as one several people may buy', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  await page.goto('/wishlist/new')
  await page.getByLabel('Nazwa').fill('Skarpetki')
  await expect(page.getByRole('radio', { name: /Unikalny/ })).toBeChecked()
  await page.getByRole('radio', { name: /Powtarzalny/ }).click()
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const socks = page.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(socks).toContainText('Powtarzalny')
  await socks.getByRole('link', { name: 'Skarpetki' }).click()
  await expect(page.getByRole('radio', { name: /Powtarzalny/ })).toBeChecked()
})

test('a repeatable item stays on offer, counting who already bought it', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  const dawid = await createPerson('Dawid')
  const socks = await addItem(dawid, 'Skarpetki', { repeatable: true })
  const bike = await addItem(dawid, 'Rower')
  const draw = await createDraw(admin, [anna, bartek, celina, dawid], {
    mode: 'open',
    drawn: true,
  })
  const dawidId = await participantOf(anna, draw, dawid)
  await buyOpen(anna, draw.id, dawidId, socks)
  await buyOpen(anna, draw.id, dawidId, bike)
  await buyOpen(bartek, draw.id, dawidId, socks)
  const secondBike = await callAs(
    bartek,
    'PUT',
    `/draws/${draw.id}/participants/${dawidId}/purchases/${bike}`,
    { purchased: true },
  )
  expect(secondBike.status).toBe(409)

  const page = await sessionOf(celina)
  await page.goto(`/draws/${draw.id}/participants/${dawidId}`)
  await expect(page.getByText('Lista prezentów · 1')).toBeVisible()
  const bikeCard = page.getByRole('article').filter({ hasText: 'Rower' })
  await expect(bikeCard).toContainText('Kupione przez inną osobę')
  await expect(bikeCard.getByRole('switch')).toBeHidden()

  const socksCard = page.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(socksCard).toContainText('Kupione już przez 2 inne osoby')
  await socksCard.getByRole('switch').click()
  await expect(socksCard.getByText('Kupione przeze mnie')).toBeVisible()
  await expect(socksCard).toContainText('Kupione już przez 2 inne osoby')
  await expect(page.getByText('Lista prezentów · 0')).toBeVisible()

  const annaPage = await sessionOf(anna)
  await annaPage.goto(`/draws/${draw.id}/participants/${dawidId}`)
  const annaSocks = annaPage.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(annaSocks).toContainText('Kupione już przez 2 inne osoby')
  await expect(annaSocks.getByRole('switch')).toBeChecked()
})

test('a repeatable item bought for an event already past is on offer again', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  await addItem(owner, 'Rower')
  const socks = await addItem(owner, 'Skarpetki', { repeatable: true })
  const last = await createDraw(admin, [owner, bartek], { drawn: true, label: 'Zeszły rok' })
  const current = await createDraw(admin, [owner, celina], { drawn: true })
  await reveal(bartek, last)
  await reveal(celina, current)
  await buy(bartek, last, socks)

  const page = await sessionOf(celina)
  await page.goto(`/draws/${current.id}`)
  await expect(page.getByRole('article').filter({ hasText: 'Skarpetki' })).toContainText(
    'Kupione już przez 1 inną osobę',
  )

  await setEventDate(last.id, warsawDateOf(-1))
  await page.reload()
  const socksCard = page.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(socksCard).toContainText('Może to kupić kilka osób')
  await expect(socksCard).not.toContainText('Kupione już')
  await expect(page.getByText('Lista prezentów · 2')).toBeVisible()
})

test('a manager may buy a repeatable item a giver bought, but not one bought once', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const bartek = await createPerson('Bartek')
  const manager = await createPerson('Marek')
  const socks = await addItem(owner, 'Skarpetki', { repeatable: true })
  const bike = await addItem(owner, 'Rower')
  const draw = await createDraw(admin, [owner, bartek], { drawn: true })
  await reveal(bartek, draw)
  await buy(bartek, draw, socks)
  await buy(bartek, draw, bike)
  await addManager(owner, manager)

  const purchaseOf = (itemId: string) =>
    callAs(manager, 'PUT', `/managers/lists/${owner.id}/purchases/${itemId}`, {
      purchased: true,
      drawId: draw.id,
    })
  expect((await purchaseOf(bike)).status).toBe(409)
  expect((await purchaseOf(socks)).status).toBe(204)

  const page = await sessionOf(manager)
  await page.goto(`/managed-lists/${owner.id}`)
  const socksCard = page.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(socksCard).toContainText('Kupione już przez 1 inną osobę')
  await expect(socksCard.getByRole('switch')).toBeChecked()
})
