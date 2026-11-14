import { test, expect, type Page } from '@chromatic-com/playwright'

// Chromatic snapshots the page when each test ends, so every test ends in a state worth reviewing.

async function fillValidBooking(page: Page) {
  await page.getByLabel('Name').fill('Kasia')
  await page.getByLabel('Email').fill('kasia@example.com')
  await page.getByLabel('Workshop', { exact: true }).selectOption({ label: 'Intro to Visual Testing' })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('books a workshop', async ({ page }) => {
  await fillValidBooking(page)
  await page.getByRole('button', { name: 'Book my seat' }).click()

  const dialog = page.getByRole('dialog', { name: 'Booking confirmed' })
  await expect(dialog).toContainText('Your confirmation number is BK-visual-testing.')
})

test('card Book preselects the workshop', async ({ page }) => {
  const card = page.getByRole('article').filter({ hasText: 'Storybook for Testers' })
  await card.getByRole('button', { name: 'Book' }).click()

  await expect(page.getByLabel('Workshop', { exact: true })).toHaveValue('storybook-for-testers')
  await expect(page.getByLabel('Name')).toBeFocused()
})

test('shows validation errors', async ({ page }) => {
  await page.getByRole('button', { name: 'Book my seat' }).click()

  await expect(page.getByText('Name is required')).toBeVisible()
  await expect(page.getByText('Email is required')).toBeVisible()
  await expect(page.locator('#workshop-error')).toHaveText('Choose a workshop')
  await expect(page.getByRole('alert')).toHaveText('Please fix the errors below')
})

test('sold-out workshop cannot be booked', async ({ page }) => {
  const card = page.getByRole('article').filter({ hasText: 'Accessibility Basics' })
  await expect(card.getByText('Sold out')).toBeVisible()
  await expect(card.getByRole('button', { name: 'Book' })).toBeDisabled()
  await expect(
    page.getByRole('option', { name: 'Accessibility Basics (sold out)' }),
  ).toBeDisabled()
})

test('empty schedule', async ({ page }) => {
  await page.goto('/?workshops=none')

  await expect(page.getByText('No workshops scheduled yet.')).toBeVisible()
})

test('double submit books once', async ({ page }) => {
  await fillValidBooking(page)
  const submit = page.getByRole('button', { name: 'Book my seat' })
  await submit.dblclick()

  await expect(page.getByRole('button', { name: 'Booking…' })).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.waitForTimeout(500)
  await expect(page.getByRole('dialog')).toHaveCount(1)
})

test('modal is keyboard friendly', async ({ page }) => {
  await fillValidBooking(page)
  await page.getByRole('button', { name: 'Book my seat' }).click()
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused()

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Book my seat' })).toBeFocused()
})
