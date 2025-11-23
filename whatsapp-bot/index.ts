import { Client, LocalAuth, Message } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import { parseWhatsAppMessage } from '../lib/services/openai.js'
import { supabase } from '../lib/supabase/supabase-bot.js'
import { checkRateLimit, updateRateLimit } from '../lib/services/rate-limit.js'

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth',
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Use system Chromium if set
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  },
})

client.on('qr', (qr) => {
  console.log('QR Code received, scan it with your phone:')
  qrcode.generate(qr, { small: true })
  console.log('\nQR Code (for remote scanning):')
  console.log(qr)
})

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready!')
})

client.on('authenticated', () => {
  console.log('✅ WhatsApp authenticated!')
})

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg)
})

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason)
})

client.on('message', async (message: Message) => {
  try {
    const from = message.from
    const body = message.body.toLowerCase().trim()
    const hasMedia = message.hasMedia
    const isForwarded = message.isForwarded

    // Check if message contains "post" or "konnect"
    const isPostCommand =
      body.includes('post') || body.includes('konnect')

    if (!isPostCommand) {
      return // Ignore non-post messages
    }

    console.log(`📨 Processing post command from ${from}`)

    // Extract phone number (remove @c.us suffix)
    const phoneNumber = from.replace('@c.us', '')

    // Check rate limit (5 posts per day for free users)
    const rateLimitCheck = await checkRateLimit(phoneNumber)
    if (!rateLimitCheck.allowed) {
      await message.reply(
        `❌ Rate limit reached. ${rateLimitCheck.message}\n\nYou can post again in ${rateLimitCheck.timeRemaining}`
      )
      return
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_premium, is_verified, city_id')
      .eq('phone', phoneNumber)
      .single()

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone: phoneNumber,
          city_id: null,
        })
        .select()
        .single()

      if (createError || !newUser) {
        await message.reply(
          'Sorry, there was an error creating your account. Please try again later.'
        )
        return
      }
      user = newUser
    }

    if (!user) {
      await message.reply('Sorry, there was an error. Please try again.')
      return
    }

    // Extract message text (remove "post" or "konnect" prefix)
    let messageText = message.body
      .replace(/^(post|konnect)\s+/i, '')
      .trim()

    // Handle forwarded messages
    if (isForwarded && messageText) {
      messageText = `Forwarded: ${messageText}`
    }

    // Download media if present
    let imageUrls: string[] = []
    if (hasMedia) {
      try {
        const media = await message.downloadMedia()
        if (media && media.mimetype?.startsWith('image/')) {
          // For now, store base64. In production, upload to Supabase Storage
          const base64Data = `data:${media.mimetype};base64,${media.data}`
          imageUrls = [base64Data]
          messageText += '\n[Image attached]'
        }
      } catch (error) {
        console.error('Error downloading media:', error)
      }
    }

    if (!messageText || messageText.trim().length === 0) {
      await message.reply(
        'Please send your post details after "post" or "konnect".\n\nExample:\npost Room available in Brampton, ₹650/month, veg only'
      )
      return
    }

    // Parse with GPT-4o-mini
    const parsedPost = await parseWhatsAppMessage(messageText)

    if (!parsedPost) {
      await message.reply(
        'Sorry, I couldn\'t parse your message. Please include: category, description, and price (if applicable).'
      )
      return
    }

    // Get or set user's city
    let cityId = user.city_id
    if (!cityId && parsedPost.city) {
      const { data: city } = await supabase
        .from('cities')
        .select('id')
        .ilike('name', `%${parsedPost.city}%`)
        .limit(1)
        .single()

      if (city) {
        cityId = city.id
        await supabase
          .from('users')
          .update({ city_id: city.id })
          .eq('id', user.id)
      }
    }

    // Create post in Supabase
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        category: parsedPost.category,
        title: parsedPost.title,
        description: parsedPost.description,
        price: parsedPost.price || null,
        currency: parsedPost.currency || 'INR',
        images: imageUrls,
        city_id: cityId,
        veg_only: parsedPost.veg_only || false,
        gender_filter: parsedPost.gender_filter || 'both',
        is_anonymous: false,
        is_premium: user.is_premium || false,
        is_verified_owner: user.is_verified || false,
        is_active: true,
      })
      .select()
      .single()

    if (postError || !post) {
      console.error('Error creating post:', postError)
      await message.reply(
        'Sorry, there was an error creating your post. Please try again later.'
      )
      return
    }

    // Update rate limit
    await updateRateLimit(phoneNumber)

    // Send success message
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indiankonnect.com'
    const postLink = `${appUrl}/posts/${post.id}`
    const remainingPosts = rateLimitCheck.remaining || 0

    const reply = `✅ Post created successfully!\n\n📱 View your post:\n${postLink}\n\n🆓 Posts remaining today: ${remainingPosts}\n\nShare this link with others!`

    await message.reply(reply)
    console.log(`✅ Post created: ${post.id} for ${phoneNumber}`)
  } catch (error) {
    console.error('Error processing message:', error)
    await message.reply(
      'Sorry, there was an error processing your message. Please try again later.'
    )
  }
})

// Initialize client
client.initialize().catch((error) => {
  console.error('Error initializing WhatsApp client:', error)
  process.exit(1)
})

// Keep process alive
process.on('SIGINT', async () => {
  console.log('Shutting down...')
  try {
    if (client.pupBrowser) {
      await client.destroy()
    }
  } catch (error) {
    console.error('Error during shutdown:', error)
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  try {
    if (client.pupBrowser) {
      await client.destroy()
    }
  } catch (error) {
    console.error('Error during shutdown:', error)
  }
  process.exit(0)
})