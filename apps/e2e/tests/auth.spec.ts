import { createDraw } from '../support/scenes'
import { addressOf, createPerson } from '../support/service'
import { expect, signIn, test } from '../support/test'

test('a signed-out visitor is sent to sign in', async ({ page }) => {
  await page.goto('/wishlist')

  await expect(page).toHaveURL(/\/login$/)
})

test('a wrong password is refused', async ({ page }) => {
  const anna = await createPerson('Anna')

  await page.goto('/login')
  await page.getByLabel('E-mail').fill(anna.email)
  await page.getByLabel('Hasło').fill('not-the-password')
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  await expect(page.getByText('Nieprawidłowy e-mail lub hasło.')).toBeVisible()
})

test('signing in lands on the start screen, and sign-in is skipped after that', async ({
  page,
}) => {
  const anna = await createPerson('Anna')

  await signIn(page, anna)
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: `Cześć, ${anna.name}!` })).toBeVisible()
})

test('someone invited before they had an account finds the draw on signing up', async ({
  page,
}) => {
  const admin = await createPerson('Admin', { admin: true })
  const email = addressOf('franek')
  const draw = await createDraw(admin, [admin, email], { drawn: true })

  await page.goto('/login')
  await page.getByRole('button', { name: 'Załóż konto' }).click()
  await page.getByLabel('Imię').fill('Franek')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill('short')
  await page.getByRole('button', { name: 'Załóż konto' }).click()
  await expect(page.getByText('Hasło musi mieć co najmniej 8 znaków.')).toBeVisible()

  await page.getByLabel('Hasło').fill('password123')
  await page.getByRole('button', { name: 'Załóż konto' }).click()

  await expect(page.getByRole('heading', { name: 'Cześć, Franek!' })).toBeVisible()
  await expect(page.getByRole('heading', { name: draw.name })).toBeVisible()
})

test('signing up with an address already taken is refused', async ({ page }) => {
  const anna = await createPerson('Anna')

  await page.goto('/login')
  await page.getByRole('button', { name: 'Załóż konto' }).click()
  await page.getByLabel('Imię').fill('Anna')
  await page.getByLabel('E-mail').fill(anna.email)
  await page.getByLabel('Hasło').fill('password123')
  await page.getByRole('button', { name: 'Załóż konto' }).click()

  await expect(page.getByText('Konto z tym e-mailem już istnieje.')).toBeVisible()
})

test('signing out forgets the previous person', async ({ page }) => {
  const admin = await createPerson('Admin', { admin: true })
  const anna = await createPerson('Anna')
  const bartek = await createPerson('Bartek')
  const annasDraw = await createDraw(admin, [admin, anna])

  await signIn(page, anna)
  await expect(page.getByRole('heading', { name: annasDraw.name })).toBeVisible()
  await page.getByRole('button', { name: 'Menu użytkownika' }).click()
  await page.getByRole('menuitem', { name: 'Wyloguj' }).click()
  await expect(page).toHaveURL(/\/login$/)

  await signIn(page, bartek)
  await expect(page.getByText('Na razie cisza na niebie')).toBeVisible()
  await expect(page.getByRole('heading', { name: annasDraw.name })).toBeHidden()
})
