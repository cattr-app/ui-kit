// AtAvatar: a real image load and a load failure (happy-dom never loads images).
import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/avatar')
})

test('an image that loads is shown without initials', async ({ page }) => {
  const avatar = demo(page, 'Image').locator('.at-avatar').first()

  await expect(avatar).toHaveCSS('background-image', /^url\("data:image\/svg\+xml,/)
  await expect(avatar.locator('.at-avatar__initials')).toBeHidden()
  await expect(avatar.locator('img')).toHaveCount(1)
})

test('an image that fails to load falls back to the initials', async ({ page }) => {
  const avatar = demo(page, 'Image').locator('.avatar-fallback')

  await expect(avatar.locator('.at-avatar__initials')).toBeVisible()
  await expect(avatar.locator('.at-avatar__initials')).toHaveText('JD')
  await expect(avatar.locator('img')).toHaveCount(0)
  await expect(avatar).toHaveCSS('background-image', 'none')
  // the palette colour for "John Doe" and its lightened text colour
  await expect(avatar).toHaveCSS('background-color', 'rgb(0, 150, 136)')
  await expect(avatar).toHaveCSS('color', 'rgb(80, 230, 216)')
})
