import { apiAs, callAs, restAs } from '../support/api'
import { addItem, createDraw, reveal } from '../support/scenes'
import { createPerson } from '../support/service'
import { expect, test } from '../support/test'

const item = { name: 'Książka', url: null, price: null, note: null, priority: 2, photoPath: null }

test('nothing but the health check answers without signing in', async () => {
  expect((await callAs(null, 'GET', '/health')).status).toBe(200)
  expect((await callAs(null, 'GET', '/draws')).status).toBe(401)
  expect((await callAs(null, 'GET', '/wishlist')).status).toBe(401)
  expect((await callAs(null, 'GET', '/admin/draws')).status).toBe(401)
})

test('someone who is not the admin is turned away from every admin action', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna])
  const fields = {
    name: 'x',
    eventDate: '2026-12-24',
    budget: null,
    mode: 'secret',
    emails: [],
    excludedPairs: [],
  }

  expect((await callAs(anna, 'GET', '/admin/draws')).status).toBe(403)
  expect((await callAs(anna, 'GET', '/admin/users')).status).toBe(403)
  expect((await callAs(anna, 'POST', '/admin/draws', fields)).status).toBe(403)
  expect((await callAs(anna, 'POST', `/admin/draws/${draw.id}/run`)).status).toBe(403)
  expect((await callAs(anna, 'POST', `/admin/draws/${draw.id}/finish`)).status).toBe(403)
  expect((await callAs(anna, 'DELETE', `/admin/draws/${draw.id}`)).status).toBe(403)
  expect(
    (await callAs(anna, 'PUT', `/admin/users/${anna.id}/password`, { password: 'password456' }))
      .status,
  ).toBe(403)

  // Skipping the API changes nothing: the database checks the caller again.
  const rpc = await restAs(anna, 'rpc/delete_draw', {
    method: 'POST',
    body: JSON.stringify({ draw_id: draw.id }),
  })
  expect(rpc.status).toBe(403)
  const direct = await restAs(anna, `draws?id=eq.${draw.id}`, { method: 'DELETE' })
  expect(direct.status).toBe(403)

  const page = await sessionOf(anna)
  await page.goto('/admin/users')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('link', { name: 'Admin' })).toBeHidden()
})

test('a draw is invisible to anyone not taking part', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const celina = await createPerson('Celina')
  const draw = await createDraw(admin, [admin, anna], { drawn: true })

  expect((await callAs(celina, 'GET', `/draws/${draw.id}`)).status).toBe(404)
  expect((await callAs(celina, 'GET', '/draws/not-a-uuid')).status).toBe(404)

  const page = await sessionOf(celina)
  await page.goto(`/draws/${draw.id}`)
  await expect(
    page.getByText('Nie znaleziono tego losowania albo nie bierzesz w nim udziału.'),
  ).toBeVisible()
})

test('nobody learns their recipient, or their list, before revealing', async () => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna], { drawn: true })
  await addItem(admin, 'Zegarek')

  const assignments = await restAs(anna, 'assignments?select=*')
  expect(await assignments.json()).toEqual([])
  expect(await apiAs(anna, 'GET', `/draws/${draw.id}/wishlist`)).toEqual([])
  expect((await apiAs<{ recipient: unknown }>(anna, 'GET', `/draws/${draw.id}`)).recipient).toBe(
    null,
  )

  await reveal(anna, draw)
  const revealed = await restAs(anna, 'assignments?select=*')
  expect(await revealed.json()).toHaveLength(1)
})

test('purchases and other people’s items are out of reach', async () => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const bartekItem = await addItem(bartek, 'Rower')
  await addItem(anna, 'Kubek')

  const purchases = await restAs(anna, 'purchases?select=*')
  expect(purchases.status).toBe(403)

  const visible = (await (await restAs(anna, 'wish_items?select=name')).json()) as unknown[]
  expect(visible).toEqual([{ name: 'Kubek' }])

  expect((await callAs(anna, 'PUT', `/wishlist/${bartekItem}`, item)).status).toBe(404)
  await callAs(anna, 'DELETE', `/wishlist/${bartekItem}`)
  expect(await apiAs<unknown[]>(bartek, 'GET', '/wishlist')).toHaveLength(1)

  // Anna draws the admin, so Bartek's item is not hers to buy.
  const draw = await createDraw(admin, [admin, anna], { drawn: true })
  await reveal(anna, draw)
  const purchase = await callAs(anna, 'PUT', `/draws/${draw.id}/purchases/${bartekItem}`, {
    purchased: true,
  })
  expect(purchase.status).toBe(403)
})

test('only web links are stored on a wish list', async () => {
  const anna = await createPerson('Anna')

  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'ftp://example.com/x']) {
    expect((await callAs(anna, 'POST', '/wishlist', { ...item, url })).status).toBe(400)
  }

  for (const url of ['https://example.com/x', 'http://example.com']) {
    expect((await callAs(anna, 'POST', '/wishlist', { ...item, url })).status).toBe(201)
  }
})
