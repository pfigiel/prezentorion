import { addItem, buy, createDraw, reveal } from '../support/scenes'
import { addressOf, createPerson, setEventDate, warsawDateOf } from '../support/service'
import { expect, test } from '../support/test'

test('a draw not yet run shows its details and who takes part', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const draw = await createDraw(admin, [admin, anna])

  const page = await sessionOf(anna)
  await expect(page.getByText('Czeka na losowanie')).toBeVisible()
  await page.getByRole('link', { name: 'Szczegóły' }).click()

  await expect(page.getByRole('heading', { name: draw.name })).toBeVisible()
  await expect(page.getByText('Gdy administrator uruchomi losowanie')).toBeVisible()
  await expect(page.getByText('Uczestnicy · 2')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: anna.name })).toContainText('Ty')
  await expect(page.getByRole('listitem').filter({ hasText: admin.name })).toBeVisible()
})

test('revealing shows the recipient and their wish list', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  await addItem(admin, 'Zegarek', { url: 'https://example.com/zegarek', price: 120, priority: 3 })
  const draw = await createDraw(admin, [admin, anna], { drawn: true })

  const page = await sessionOf(anna)
  await page.getByRole('link', { name: 'Odkryj wylosowaną osobę' }).click()
  await page.getByRole('button', { name: /Dotknij, aby odkryć/ }).click()

  await expect(page.getByText('Kupujesz prezent dla')).toBeVisible()
  await expect(page.getByText(admin.name, { exact: true })).toBeVisible()
  const watch = page.getByRole('article').filter({ hasText: 'Zegarek' })
  await expect(watch).toContainText('ok. 120 zł')
  await expect(watch.getByRole('link', { name: 'otwórz link' })).toHaveAttribute(
    'href',
    'https://example.com/zegarek',
  )

  await page.getByRole('link', { name: 'Wstecz' }).click()
  await expect(
    page.getByRole('link', { name: new RegExp(`Kupujesz prezent dla.*${admin.name}`) }),
  ).toBeVisible()
  await page.goto(`/draws/${draw.id}`)
  await expect(page.getByRole('button', { name: /Dotknij, aby odkryć/ })).toBeHidden()
})

test('a giver sees only what fits the budget', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  await addItem(admin, 'Rower', { price: 151 })
  await addItem(admin, 'Zegarek', { price: 150 })
  await addItem(admin, 'Skarpetki')
  const draw = await createDraw(admin, [admin, anna], { budget: 150, drawn: true })
  await reveal(anna, draw)

  const page = await sessionOf(anna)
  await page.goto(`/draws/${draw.id}`)

  await expect(page.getByText('Lista prezentów · 2')).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Zegarek' })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Skarpetki' })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Rower' })).toBeHidden()
})

test('a recipient who has not signed in yet is shown by address', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const email = addressOf('dawid')
  const draw = await createDraw(admin, [anna, email], { drawn: true })

  const page = await sessionOf(anna)
  await page.goto(`/draws/${draw.id}`)
  await page.getByRole('button', { name: /Dotknij, aby odkryć/ }).click()

  await expect(page.getByText(email, { exact: true })).toBeVisible()
  await expect(page.getByText('Ta osoba jeszcze się nie zalogowała')).toBeVisible()
})

test('a giver marks what they bought, and it stays marked', async ({ sessionOf }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  await addItem(admin, 'Zegarek', { priority: 3 })
  await addItem(admin, 'Skarpetki', { priority: 1 })
  const draw = await createDraw(admin, [admin, anna], { drawn: true })
  await reveal(anna, draw)

  const page = await sessionOf(anna)
  await page.goto(`/draws/${draw.id}`)
  await expect(page.getByText('Lista prezentów · 2')).toBeVisible()

  const watch = page.getByRole('article').filter({ hasText: 'Zegarek' })
  await expect(watch.getByRole('switch', { name: 'Oznacz jako kupione' })).not.toBeChecked()
  await watch.getByRole('switch').click()
  await expect(watch.getByText('Kupione przeze mnie')).toBeVisible()
  await expect(page.getByText('Lista prezentów · 1')).toBeVisible()

  await page.reload()
  await expect(watch.getByRole('switch')).toBeChecked()

  await watch.getByRole('switch').click()
  await expect(watch.getByRole('switch')).not.toBeChecked()
  await expect(page.getByText('Lista prezentów · 2')).toBeVisible()
})

test('a gift bought by another giver is marked, then gone once that event has passed', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const bartek = await createPerson('Bartek')
  const celina = await createPerson('Celina')
  const itemId = await addItem(owner, 'Rower')
  const christmas = await createDraw(admin, [owner, bartek], { drawn: true })
  const birthday = await createDraw(admin, [owner, celina], { drawn: true, label: 'Urodziny' })
  await reveal(bartek, christmas)
  await reveal(celina, birthday)
  await buy(bartek, christmas, itemId)

  const page = await sessionOf(celina)
  await page.goto(`/draws/${birthday.id}`)
  const bike = page.getByRole('article').filter({ hasText: 'Rower' })
  await expect(bike).toContainText('Kupione przez inną osobę')
  await expect(bike.getByRole('switch')).toBeHidden()

  await setEventDate(christmas.id, warsawDateOf(-1))
  await page.reload()
  await expect(page.getByText('Lista prezentów · 0')).toBeVisible()
  await expect(bike).toBeHidden()

  const bartekPage = await sessionOf(bartek)
  const card = bartekPage.locator('[data-surface]').filter({ hasText: christmas.name })
  await expect(card.getByText('Zakończone')).toBeVisible()
})
