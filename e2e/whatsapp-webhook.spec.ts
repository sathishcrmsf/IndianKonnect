import { test, expect } from '@playwright/test'

test.describe('WhatsApp Webhook', () => {
  test('should handle post command via webhook', async ({ request }) => {
    const formData = new URLSearchParams({
      From: 'whatsapp:+1234567890',
      Body: 'post Room available in Brampton, ₹650/month, veg only',
      MessageSid: 'SM1234567890',
    })

    const response = await request.post('/api/whatsapp/incoming', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
    })

    // Should return TwiML response
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('<?xml')
  })

  test('should ignore non-post messages', async ({ request }) => {
    const formData = new URLSearchParams({
      From: 'whatsapp:+1234567890',
      Body: 'Hello, how are you?',
      MessageSid: 'SM1234567890',
    })

    const response = await request.post('/api/whatsapp/incoming', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
    })

    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('<?xml')
  })

  test('should return webhook status on GET', async ({ request }) => {
    const response = await request.get('/api/whatsapp/incoming')
    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json.message).toContain('webhook')
  })
})

