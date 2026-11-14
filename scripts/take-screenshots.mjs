// Regenerates the README screenshots in docs/images.
// Run `npm run build && npm run build-storybook` first, then `npm run screenshots`.
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const out = 'docs/images'
const app = await preview({ logLevel: 'silent', preview: { port: 4173, strictPort: true } })
const storybook = await preview({
  logLevel: 'silent',
  build: { outDir: 'storybook-static' },
  preview: { port: 6007, strictPort: true },
})

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } })

  await page.goto('http://localhost:4173')
  await page.getByRole('heading', { name: 'Book a workshop' }).waitFor()
  await page.screenshot({ path: `${out}/booking-page.png`, fullPage: true })

  await page.getByRole('button', { name: 'Book my seat' }).click()
  await page.getByRole('alert').waitFor()
  await page.screenshot({ path: `${out}/validation-errors.png`, fullPage: true })

  await page.getByLabel('Name').fill('Kasia')
  await page.getByLabel('Email').fill('kasia@example.com')
  await page.getByLabel('Workshop', { exact: true }).selectOption({ label: 'Intro to Visual Testing' })
  await page.getByRole('button', { name: 'Book my seat' }).click()
  await page.getByRole('dialog', { name: 'Booking confirmed' }).waitFor()
  await page.screenshot({ path: `${out}/confirmation-modal.png` })

  const wide = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await wide.goto('http://localhost:6007/?path=/story/components-workshopcard--available')
  await wide
    .frameLocator('#storybook-preview-iframe')
    .getByRole('heading', { name: 'Intro to Visual Testing' })
    .waitFor()
  await wide.screenshot({ path: `${out}/storybook.png` })
} finally {
  await browser.close()
  await app.close()
  await storybook.close()
}
