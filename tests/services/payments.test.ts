import { describe, it, expect, vi } from 'vitest'
import { createRazorpayOrder, createStripePayment, verifyRazorpayPayment, verifyStripePayment } from '@/lib/services/payments'

describe('Payment Services', () => {
  describe('createRazorpayOrder', () => {
    it('should create a Razorpay order with correct amount in paise', async () => {
      const order = await createRazorpayOrder(299, 'INR')
      
      expect(order).toHaveProperty('id')
      expect(order.amount).toBe(29900) // 299 * 100 paise
      expect(order.currency).toBe('INR')
    })

    it('should handle mock mode when API keys are missing', async () => {
      const order = await createRazorpayOrder(19, 'USD')
      
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('status')
    })
  })

  describe('createStripePayment', () => {
    it('should create a Stripe payment with correct amount in cents', async () => {
      const payment = await createStripePayment(19, 'USD')
      
      expect(payment).toHaveProperty('id')
      expect(payment.amount).toBe(1900) // 19 * 100 cents
      expect(payment.currency).toBe('usd')
    })

    it('should return client secret for Stripe', async () => {
      const payment = await createStripePayment(19, 'USD')
      
      expect(payment).toHaveProperty('clientSecret')
    })
  })

  describe('verifyRazorpayPayment', () => {
    it('should verify Razorpay payment', async () => {
      const result = await verifyRazorpayPayment('payment_123', 'order_123', 'signature_123')
      
      expect(result).toHaveProperty('success')
    })
  })

  describe('verifyStripePayment', () => {
    it('should verify Stripe payment', async () => {
      const result = await verifyStripePayment('pi_123')
      
      expect(result).toHaveProperty('success')
    })
  })
})

