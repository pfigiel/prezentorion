import { addItem, buy, createDraw, reveal } from '../support/scenes'
import { createPerson, setEventDate, warsawDateOf } from '../support/service'
import { expect, test } from '../support/test'

const photo = new URL('../fixtures/gift.png', import.meta.url).pathname

test('a new person is invited to start a list', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  await expect(page.getByText('Twoja lista jest pusta')).toBeVisible()
  await page.getByRole('link', { name: 'Dodaj pierwszą pozycję' }).click()

  await expect(page.getByRole('heading', { name: 'Nowa pozycja' })).toBeVisible()
})

test('the form explains what is wrong before anything is saved', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  await page.goto('/wishlist/new')
  await page.getByLabel('Nazwa').fill('   ')
  await page.getByLabel('Link').fill('not a url')
  await page.getByLabel('Orientacyjna cena (zł)').fill('12,50')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByText('Podaj nazwę.')).toBeVisible()
  await expect(page.getByText('To nie wygląda na link.')).toBeVisible()
  await expect(page.getByText('Podaj kwotę w pełnych złotych.')).toBeVisible()
  await expect(page).toHaveURL(/\/wishlist\/new$/)
})

test('an item is added with a photo, edited and deleted', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  await page.goto('/wishlist')
  await page.getByRole('button', { name: 'Dodaj', exact: true }).click()
  await page.getByLabel('Nazwa').fill('Słuchawki')
  await page.getByLabel('Link').fill('allegro.pl/sluchawki')
  await page.getByLabel('Orientacyjna cena (zł)').fill('120')
  await page.getByRole('radio', { name: 'Priorytet 3 z 3' }).click()
  await page.locator('input[type=file]').setInputFiles(photo)
  await expect(page.getByRole('button', { name: 'Usuń zdjęcie' })).toBeVisible()
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const row = page.getByRole('article').filter({ hasText: 'Słuchawki' })
  await expect(row).toContainText('ok. 120 zł')
  await expect(row.locator('img')).toBeVisible()

  await row.getByRole('button', { name: 'Więcej opcji' }).click()
  await page.getByRole('menuitem', { name: 'Edytuj' }).click()
  await expect(page.getByLabel('Link')).toHaveValue('https://allegro.pl/sluchawki')
  await page.getByLabel('Nazwa').fill('Słuchawki nauszne')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  const renamed = page.getByRole('article').filter({ hasText: 'Słuchawki nauszne' })
  await expect(renamed).toBeVisible()
  await renamed.getByRole('button', { name: 'Więcej opcji' }).click()
  await page.getByRole('menuitem', { name: 'Usuń' }).click()
  const dialog = page.getByRole('dialog', { name: 'Usunąć pozycję?' })
  await dialog.getByRole('button', { name: 'Usuń' }).click()

  await expect(renamed).toBeHidden()
  await expect(page.getByText('Twoja lista jest pusta')).toBeVisible()
})

test('a link to an item no longer on the list says so', async ({ sessionOf }) => {
  const anna = await createPerson('Anna')

  const page = await sessionOf(anna)
  await page.goto(`/wishlist/${crypto.randomUUID()}/edit`)

  await expect(page.getByText('Tej pozycji nie ma już na Twojej liście.')).toBeVisible()
  await page.getByRole('button', { name: 'Wróć do listy' }).click()
  await expect(page).toHaveURL(/\/wishlist$/)
})

test('the owner sees a gift as bought only from the event day, and can offer it again', async ({
  sessionOf,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const owner = await createPerson('Ola')
  const anna = await createPerson('Anna')
  const itemId = await addItem(owner, 'Zegarek')
  const draw = await createDraw(admin, [owner, anna], { drawn: true })
  await reveal(anna, draw)
  await buy(anna, draw, itemId)

  const page = await sessionOf(owner)
  await page.goto('/wishlist')
  const watch = page.getByRole('article').filter({ hasText: 'Zegarek' })
  await expect(watch).toBeVisible()
  await expect(watch.getByText('Kupione')).toBeHidden()

  await setEventDate(draw.id, warsawDateOf())
  await page.reload()
  await expect(watch.getByText('Kupione')).toBeVisible()

  await watch.getByRole('button', { name: 'Więcej opcji' }).click()
  await page.getByRole('menuitem', { name: 'Oznacz jako wciąż dostępne' }).click()
  await expect(watch.getByText('Kupione')).toBeHidden()
})
