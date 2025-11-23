/**
 * Mock payment services
 * In production, this would integrate with Razorpay (India) and Stripe (rest of world)
 */

export async function createRazorpayOrder(amount: number, currency: string = "INR") {
  // Mock implementation
  return {
    id: "mock_razorpay_order_id",
    amount,
    currency,
    status: "created",
  }
}

export async function createStripePayment(amount: number, currency: string = "USD") {
  // Mock implementation
  return {
    id: "mock_stripe_payment_id",
    amount,
    currency,
    status: "created",
    clientSecret: "mock_client_secret",
  }
}

export async function verifyPayment(paymentId: string, provider: "razorpay" | "stripe") {
  // Mock implementation
  return {
    success: true,
    paymentId,
    provider,
  }
}

