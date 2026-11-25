import { apiAs } from '../support/api'
import { addItem, addManager, buy, createDraw, reveal } from '../support/scenes'
import { createPerson, setEventDate, warsawDateOf } from '../support/service'
import { expect, test } from '../support/test'

test('an owner gives their list to a manager by address and takes it back', async ({
  sessionOf,
}) => {
  const owner = await createPerson('Ola')
  const manager = await createPerson('Marek')

  const page = await sessionOf(owner)
  await page.goto('/wishlist')
  await page.getByRole('link', { name: 'Kto zarządza moją listą' }).click()
  await expect(page.getByRole('heading', { name: 'Zarządzanie listą' })).toBeVisible()
  await expect(page.getByText('Nikt jeszcze nie zarządza Twoją listą.')).toBeVisible()

  const email = page.getByLabel('E-mail osoby zarządzającej')
  const add = page.getByRole('button', { name: 'Dodaj', exact: true })
  await email.fill('not an address')
  await add.click()
  await expect(page.getByText('Wpisz poprawny adres e-mail.')).toBeVisible()
  await email.fill(owner.email)
  await add.click()
  await expect(page.getByText('To Twój własny adres.')).toBeVisible()

  await email.fill(manager.email.toUpperCase())
  await add.click()
  await expect(page.getByText('Osoby zarządzające · 1')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: manager.email })).toBeVisible()
  await expect(page.getByText(manager.name)).toBeHidden()
  await email.fill(manager.email)
  await add.click()
  await expect(page.getByText('Ta osoba już zarządza Twoją listą.')).toBeVisible()

  const managerPage = await sessionOf(manager)
  await managerPage.goto('/wishlist')
  await managerPage.getByRole('link', { name: new RegExp(owner.name) }).click()
  await expect(managerPage.getByRole('heading', { name: owner.name })).toBeVisible()

  await page.getByRole('button', { name: `Usuń ${manager.email}` }).click()
  await expect(page.getByText('Nikt jeszcze nie zarządza Twoją listą.')).toBeVisible()
  await managerPage.reload()
  await expect(
    managerPage.getByText('Nie znaleziono tej listy albo nie masz już do niej dostępu.'),
  ).toBeVisible()
})

test('a manager files a purchase under the owner’s draw, and givers see it taken', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const anna = await createPerson('Anna')
  const manager = await createPerson('Marek')
  await addItem(owner, 'Zegarek', { priority: 3 })
  const socksId = await addItem(owner, 'Skarpetki', { priority: 1 })
  await addManager(owner, manager)
  const draw = await createDraw(admin, [owner, anna], { drawn: true })
  await reveal(anna, draw)
  await buy(anna, draw, socksId)

  const page = await sessionOf(manager)
  await page.goto('/wishlist')
  await page.getByRole('link', { name: new RegExp(owner.name) }).click()
  await expect(page.getByText('Lista prezentów · 1')).toBeVisible()
  const socks = page.getByRole('article').filter({ hasText: 'Skarpetki' })
  await expect(socks.getByText('Kupione przez inną osobę')).toBeVisible()

  const watch = page.getByRole('article').filter({ hasText: 'Zegarek' })
  await expect(watch.getByRole('switch', { name: 'Oznacz jako kupione' })).not.toBeChecked()
  await watch.getByRole('switch').click()
  const dialog = page.getByRole('dialog', { name: 'Oznaczyć jako kupione?' })
  await expect(dialog.getByLabel('Losowanie')).toHaveValue(new RegExp(draw.name))
  await dialog.getByRole('button', { name: 'Oznacz jako kupione' }).click()
  await expect(dialog).toBeHidden()
  await expect(watch.getByText('Kupione przeze mnie')).toBeVisible()
  await expect(page.getByText('Lista prezentów · 0')).toBeVisible()

  const annaPage = await sessionOf(anna)
  await annaPage.goto(`/draws/${draw.id}`)
  await expect(
    annaPage
      .getByRole('article')
      .filter({ hasText: 'Zegarek' })
      .getByText('Kupione przez inną osobę'),
  ).toBeVisible()

  await apiAs(admin, 'POST', `/admin/draws/${draw.id}/run`)
  await page.reload()
  await expect(watch.getByRole('switch')).toBeChecked()

  const ownerPage = await sessionOf(owner)
  await ownerPage.goto('/wishlist')
  const ownersWatch = ownerPage.getByRole('article').filter({ hasText: 'Zegarek' })
  await expect(ownersWatch).toBeVisible()
  await expect(ownersWatch.getByText('Kupione')).toBeHidden()

  await setEventDate(draw.id, warsawDateOf(-1))
  await ownerPage.reload()
  await expect(ownersWatch.getByText('Kupione')).toBeVisible()
})

test('with no draw under way, the owner sees a manager’s purchase straight away', async ({
  sessionOf,
}) => {
  const owner = await createPerson('Ola')
  const manager = await createPerson('Marek')
  await addItem(owner, 'Zegarek')
  await addManager(owner, manager)

  const page = await sessionOf(manager)
  await page.goto(`/managed-lists/${owner.id}`)
  const watch = page.getByRole('article').filter({ hasText: 'Zegarek' })
  await watch.getByRole('switch').click()
  const dialog = page.getByRole('dialog', { name: 'Oznaczyć jako kupione?' })
  await expect(dialog).toContainText('nie bierze teraz udziału w żadnym losowaniu')
  await dialog.getByRole('button', { name: 'Anuluj' }).click()
  await expect(watch.getByRole('switch')).not.toBeChecked()

  await watch.getByRole('switch').click()
  await dialog.getByRole('button', { name: 'Oznacz jako kupione' }).click()
  await expect(watch.getByText('Kupione przeze mnie')).toBeVisible()

  const ownerPage = await sessionOf(owner)
  await ownerPage.goto('/wishlist')
  await expect(
    ownerPage.getByRole('article').filter({ hasText: 'Zegarek' }).getByText('Kupione'),
  ).toBeVisible()

  await watch.getByRole('switch').click()
  await expect(watch.getByText('Kupione przeze mnie')).toBeHidden()
  await ownerPage.reload()
  await expect(ownerPage.getByRole('article').filter({ hasText: 'Zegarek' })).toBeVisible()
  await expect(
    ownerPage.getByRole('article').filter({ hasText: 'Zegarek' }).getByText('Kupione'),
  ).toBeHidden()
})

test('nobody but a manager reaches the list', async ({ sessionOf }) => {
  const owner = await createPerson('Ola')
  const stranger = await createPerson('Obcy')
  const itemId = await addItem(owner, 'Zegarek')

  const page = await sessionOf(stranger)
  await page.goto(`/managed-lists/${owner.id}`)
  await expect(
    page.getByText('Nie znaleziono tej listy albo nie masz już do niej dostępu.'),
  ).toBeVisible()

  await expect(
    apiAs(stranger, 'PUT', `/managers/lists/${owner.id}/purchases/${itemId}`, {
      purchased: true,
      drawId: null,
    }),
  ).rejects.toThrow(/403/)
})

test('a manager finds the lists they manage under their own list', async ({ sessionOf }) => {
  const owner = await createPerson('Ola')
  const manager = await createPerson('Marek')
  await addManager(owner, manager)

  const page = await sessionOf(manager)
  await expect(page.getByText('Zarządzasz listą')).toBeHidden()
  await page.goto('/wishlist')
  const settings = page.getByRole('link', { name: 'Kto zarządza moją listą' })
  const list = page.getByRole('link', { name: new RegExp(`Zarządzasz listą.*${owner.name}`) })
  await expect(list).toBeVisible()
  const [labelBox, listBox, settingsBox] = await Promise.all(
    [page.getByText('Zarządzane listy'), list, settings].map((element) => element.boundingBox()),
  )
  expect(listBox?.y).toBeGreaterThan(labelBox?.y ?? Infinity)
  expect(settingsBox?.y).toBeGreaterThan(listBox?.y ?? Infinity)

  await list.click()
  await expect(page.getByRole('heading', { name: owner.name })).toBeVisible()
  await page.getByRole('link', { name: 'Wstecz' }).click()
  await expect(page).toHaveURL(/\/wishlist$/)
})
