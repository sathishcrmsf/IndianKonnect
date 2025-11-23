import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('should complete onboarding flow', async ({ page }) => {
    await page.goto('/onboarding')

    // Screen 1: Click continue
    await expect(page.getByText('Continue with WhatsApp')).toBeVisible()
    await page.getByText('Continue with WhatsApp').click()

    // Screen 2: Select country and enter phone
    await expect(page.getByText('Enter your phone number')).toBeVisible()
    await page.getByText('+91').click() // Select India
    await page.fill('input[type="tel"]', '1234567890')
    await page.getByText('Continue').click()

    // Screen 3: Select city
    await expect(page.getByText('Choose your city')).toBeVisible()
    await page.getByText('Toronto').click()
    await page.getByText('Get Started').click()

    // Should redirect to home
    await expect(page).toHaveURL(/\/home/)
  })
})

