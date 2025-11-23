import { test, expect } from '@playwright/test'

test.describe('Pricing Page', () => {
  test('should display pricing page with India and International plans', async ({ page }) => {
    await page.goto('/pricing')

    // Check page title
    await expect(page.getByText('Upgrade to Lifetime')).toBeVisible()

    // Check plan options
    await expect(page.getByText('India')).toBeVisible()
    await expect(page.getByText('₹299')).toBeVisible()
    await expect(page.getByText('International')).toBeVisible()
    await expect(page.getByText('$19')).toBeVisible()

    // Check benefits
    await expect(page.getByText('Verified Blue Tick')).toBeVisible()
    await expect(page.getByText('Priority Listing')).toBeVisible()
  })

  test('should switch between India and International plans', async ({ page }) => {
    await page.goto('/pricing')

    // Click International plan
    await page.getByText('International').click()

    // Check that International is selected
    const internationalButton = page.locator('button:has-text("International")').first()
    await expect(internationalButton).toHaveClass(/border-whatsapp-green/)

    // Check button shows $19
    await expect(page.getByText('Upgrade Now - $19')).toBeVisible()
  })

  test('should show countdown timer', async ({ page }) => {
    await page.goto('/pricing')

    // Check countdown is visible
    await expect(page.getByText(/spots left/)).toBeVisible()
  })
})

