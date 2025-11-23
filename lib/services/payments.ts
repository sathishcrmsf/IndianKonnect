/**
 * Real payment services using Razorpay and Stripe SDKs
 */

import Razorpay from "razorpay"
import Stripe from "stripe"

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// Initialize Razorpay (server-side only)
let razorpayInstance: Razorpay | null = null
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
}

// Initialize Stripe (server-side only)
let stripeInstance: Stripe | null = null
if (STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-11-17.clover",
  })
}

export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR"
) {
  // Convert to paise (Razorpay uses smallest currency unit)
  const amountInPaise = Math.round(amount * 100)

  if (!razorpayInstance) {
    // Mock for development
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInPaise,
      currency,
      status: "created",
    }
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
    })

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
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

  if (!stripeInstance) {
    // Mock for development
    return {
      id: `pi_mock_${Date.now()}`,
      amount: amountInCents,
      currency: currency.toLowerCase(),
      status: "created",
      clientSecret: `pi_mock_${Date.now()}_secret`,
    }
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ["card"],
      metadata: {
        product: "indiankonnect_lifetime",
      },
    })

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error("Stripe error:", error)
    throw error
  }
}

export async function verifyRazorpayPayment(
  paymentId: string,
  orderId: string,
  signature: string
) {
  if (!razorpayInstance) {
    // Mock verification for development
    return { success: true, paymentId, orderId }
  }

  try {
    const crypto = require("crypto")
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    if (generatedSignature === signature) {
      // Verify payment status
      const payment = await razorpayInstance.payments.fetch(paymentId)
      return {
        success: payment.status === "captured",
        paymentId,
        orderId,
        amount: typeof payment.amount === "number" ? payment.amount / 100 : Number(payment.amount) / 100, // Convert from paise
      }
    }

    return { success: false, error: "Invalid signature" }
  } catch (error) {
    console.error("Razorpay verification error:", error)
    return { success: false, error: "Verification failed" }
  }
}

export async function verifyStripePayment(paymentIntentId: string) {
  if (!stripeInstance) {
    // Mock verification for development
    return { success: true, paymentId: paymentIntentId }
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(
      paymentIntentId
    )

    return {
      success: paymentIntent.status === "succeeded",
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
    }
  } catch (error) {
    console.error("Stripe verification error:", error)
    return { success: false, error: "Verification failed" }
  }
}

