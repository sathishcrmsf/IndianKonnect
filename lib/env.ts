export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  },
  payments: {
    razorpay: {
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      secretKey: process.env.STRIPE_SECRET_KEY || "",
    },
  },
  whatsapp: {
    businessApiToken: process.env.WHATSAPP_BUSINESS_API_TOKEN || "",
    businessApiPhoneId: process.env.WHATSAPP_BUSINESS_API_PHONE_ID || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;

