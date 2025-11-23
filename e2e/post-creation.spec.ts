import { test, expect } from '@playwright/test'

test.describe('Post Creation', () => {
  test('should create a new post', async ({ page }) => {
    // Navigate to create page (assuming user is logged in)
    await page.goto('/create')

    // Select category
    await page.getByText('Room / PG for Rent').click()

    // Fill in form
    await page.fill('input[placeholder="Title"]', 'Test Room')
    await page.fill('textarea[placeholder="Description"]', 'This is a test room description')

    // Submit
    await page.getByText('Share to IndianKonnect').click()

    // Should redirect or show success
    await expect(page).toHaveURL(/\/home/)
  })
})

