/**
 * Payment services
 * Integrates with Razorpay (India) and Stripe (rest of world)
 */

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR"
) {
  // Convert to paise (Razorpay uses smallest currency unit)
  const amountInPaise = Math.round(amount * 100)

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    // Mock for development
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInPaise,
      currency,
      status: "created",
    }
  }

  try {
    // In production, create order via Razorpay API
    // const response = await fetch('https://api.razorpay.com/v1/orders', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
    //   },
    //   body: JSON.stringify({
    //     amount: amountInPaise,
    //     currency,
    //     receipt: `receipt_${Date.now()}`,
    //   })
    // })
    // return response.json()

    // Mock for now
    return {
      id: `order_${Date.now()}`,
      amount: amountInPaise,
      currency,
      status: "created",
    }
  } catch (error) {
    console.error("Razorpay error:", error)
    throw error
  }
}

export async function createStripePayment(
  amount: number,
  currency: string = "USD"
) {
  // Convert to cents (Stripe uses smallest currency unit)
  const amountInCents = Math.round(amount * 100)

  if (!STRIPE_SECRET_KEY) {
    // Mock for development
    return {
      id: `pi_mock_${Date.now()}`,
      amount: amountInCents,
      currency,
      status: "created",
      clientSecret: `pi_mock_${Date.now()}_secret`,
    }
  }

  try {
    // In production, create payment intent via Stripe API
    // const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
    //   },
    //   body: new URLSearchParams({
    //     amount: amountInCents.toString(),
    //     currency: currency.toLowerCase(),
    //     payment_method_types: 'card',
    //   })
    // })
    // return response.json()

    // Mock for now
    return {
      id: `pi_${Date.now()}`,
      amount: amountInCents,
      currency,
      status: "created",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
    }
  } catch (error) {
    console.error("Stripe error:", error)
    throw error
  }
}

export async function verifyPayment(
  paymentId: string,
  provider: "razorpay" | "stripe"
) {
  if (provider === "razorpay") {
    // In production, verify with Razorpay API
    // const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
    //   }
    // })
    // const payment = await response.json()
    // return { success: payment.status === 'captured', paymentId, provider }

    // Mock: always succeed in development
    return {
      success: true,
      paymentId,
      provider,
    }
  } else {
    // Stripe verification
    // const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
    //   }
    // })
    // const payment = await response.json()
    // return { success: payment.status === 'succeeded', paymentId, provider }

    // Mock: always succeed in development
    return {
      success: true,
      paymentId,
      provider,
    }
  }
}

