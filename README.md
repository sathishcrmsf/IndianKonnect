# IndianKonnect Web App

A mobile-first web application for connecting Indians abroad - Rooms, Rides, Deals, Parcels, and Jobs.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Supabase** for backend
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials and other API keys.

3. Set up Supabase database:
- Create a new Supabase project
- Run the SQL schema from `lib/supabase/schema.sql` in your Supabase SQL editor

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── (main)/            # Main app screens (home, posts, profile, etc.)
│   ├── onboarding/        # Onboarding flow
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── navigation/        # Navigation components
│   ├── post/              # Post-related components
│   ├── filters/           # Filter components
│   └── ui/                # Base UI components (shadcn)
├── lib/                   # Utilities and services
│   ├── supabase/          # Supabase client and schema
│   ├── mocks/             # Mock services for development
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript type definitions
├── tests/                 # Unit tests (Vitest)
└── e2e/                   # E2E tests (Playwright)
```

## Features Implemented

### Phase 1: Landing Page ✅
- Hero section with tagline
- WhatsApp-style green button
- Supported cities list
- Hindi toggle (UI ready)

### Phase 2: Post Creation ✅
- 8 category types with emojis
- Photo upload (max 4)
- Price, description, filters
- Anonymous posting option

### Phase 3: Map & List View ✅
- List view with post cards
- Map view structure (ready for Google Maps API)
- Filters integration
- WhatsApp chat buttons

### Phase 4: WhatsApp Webhook Integration ✅
- Twilio webhook endpoint (`/api/whatsapp/incoming`)
- GPT-4o-mini message parsing
- Automatic post creation from WhatsApp messages
- Free post limits (first 100 posts free, then Premium only)
- Automatic WhatsApp replies with post links
- User auto-creation from phone numbers

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## Environment Variables

See `.env.example` for all required environment variables.

## Mock Services

The app includes mock services for:
- WhatsApp OTP verification
- Payment processing (Razorpay/Stripe)
- Google Maps

These are ready to be replaced with real integrations when API keys are provided.

## Next Steps

1. Add your Supabase credentials to `.env.local`
2. Run the database schema in Supabase
3. Add Google Maps API key for map functionality
4. Configure payment providers (Razorpay/Stripe) for Phase 5
5. Set up Twilio and OpenAI for WhatsApp integration (Phase 4) - See `docs/PHASE4_WHATSAPP_WEBHOOK.md`

## Phase 4 Setup

To enable WhatsApp webhook integration:

1. **Twilio Setup:**
   - Sign up for Twilio and get a WhatsApp-enabled number
   - Add credentials to `.env.local`:
     ```
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=whatsapp:+14155238886
     ```
   - Configure webhook URL in Twilio: `https://yourdomain.com/api/whatsapp/incoming`

2. **OpenAI Setup:**
   - Get OpenAI API key
   - Add to `.env.local`:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ```

3. **Usage:**
   - Users send WhatsApp message: `post Room available in Brampton, ₹650/month`
   - System automatically creates post and replies with link

See `docs/PHASE4_WHATSAPP_WEBHOOK.md` for detailed documentation.

## License

MIT

