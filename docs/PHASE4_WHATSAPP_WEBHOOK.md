# Phase 4: WhatsApp Webhook Integration

## Overview

Phase 4 implements automatic post creation from WhatsApp messages. Users can forward any message to the IndianKonnect WhatsApp number and type "post" or "konnect" to automatically create a post.

## Features

- **Twilio WhatsApp Webhook**: Receives incoming WhatsApp messages
- **GPT-4o-mini Parsing**: Intelligently extracts post information from natural language
- **Auto Post Creation**: Creates posts in Supabase automatically
- **Free Post Limits**: First 100 posts are free, then only Premium users can post
- **Automatic Replies**: Sends confirmation with post link via WhatsApp

## Setup

### 1. Twilio Configuration

1. Sign up for [Twilio](https://www.twilio.com/)
2. Get a WhatsApp-enabled phone number
3. Configure webhook URL in Twilio Console:
   - URL: `https://yourdomain.com/api/whatsapp/incoming`
   - Method: POST
   - Content Type: `application/x-www-form-urlencoded`

### 2. Environment Variables

Add to `.env.local`:

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App URL
NEXT_PUBLIC_APP_URL=https://indiankonnect.com
```

### 3. OpenAI API Key

1. Sign up for [OpenAI](https://platform.openai.com/)
2. Create an API key
3. Add to environment variables

## Usage

### User Flow

1. User forwards a message to IndianKonnect WhatsApp number
2. User types: `post Room available in Brampton, ₹650/month, veg only`
3. System:
   - Parses the message with GPT-4o-mini
   - Extracts: category, title, description, price, filters
   - Creates post in Supabase
   - Replies with post link

### Example Messages

**Room Rental:**
```
post Room available in Brampton, ₹650/month, veg only kitchen, female preferred
```

**Ride Share:**
```
konnect Ride share from Toronto to Montreal, leaving Friday, $50 per person
```

**Job Posting:**
```
post Software engineer position available, 5+ years experience, $80k salary
```

## API Endpoint

### POST /api/whatsapp/incoming

**Request (Twilio Webhook):**
```
From: whatsapp:+1234567890
Body: post Room available...
MessageSid: SM1234567890
```

**Response:**
- TwiML XML (empty response, message sent separately)
- Or JSON error response

## Post Limits

- **First 100 posts**: Free for all users
- **After 100 posts**: Only Premium users can post
- Users receive a message with upgrade link if limit reached

## Error Handling

- Invalid message format → Help message sent
- Parsing failure → Error message with instructions
- Database error → Error message, post not created
- User not found → User created automatically
- Post limit reached → Upgrade message sent

## Testing

### Local Testing

Use Twilio's webhook testing tool or ngrok to expose local server:

```bash
ngrok http 3000
# Use ngrok URL in Twilio webhook: https://abc123.ngrok.io/api/whatsapp/incoming
```

### Mock Mode

Without API keys, the system uses mock parsers:
- Simple keyword-based parsing
- Mock WhatsApp sending (logs to console)

## Security

- Webhook validation (add Twilio signature verification)
- Rate limiting (prevent spam)
- Phone number verification
- Input sanitization

## Next Steps

- Add image support from WhatsApp
- Support multiple languages
- Add post editing via WhatsApp
- Implement post moderation

