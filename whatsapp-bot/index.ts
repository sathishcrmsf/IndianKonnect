import { Client, LocalAuth, Message } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import { parseWhatsAppMessage } from '../lib/services/openai.js'
import { supabase } from '../lib/supabase/supabase-bot.js'
import { checkAndIncrementRateLimit } from '../lib/services/rate-limit.js'
import { uploadImage } from '../lib/services/storage.js'
import { normalizePhoneNumber } from '../lib/utils/phone.js'
import { matchCity } from '../lib/services/city-matcher.js'
import { validatePostData } from '../lib/services/post-validator.js'
import { canUserPost } from '../lib/services/post-limits-bot.js'
import { sanitizeMessage } from '../lib/utils/sanitize.js'
import { logError, logInfo, logException } from '../lib/services/logger.js'

// Maximum price allowed by database (DECIMAL(10, 2) = 99,999,999.99)
const MAX_PRICE = 99999999.99

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
  // Extract and normalize phone number early for error handling
  const phoneNumber = normalizePhoneNumber(message.from)
  
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

    logInfo('Processing post command', { phoneNumber })

    // Check and increment rate limit atomically (5 posts per day for free users)
    const rateLimitCheck = await checkAndIncrementRateLimit(phoneNumber)
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

    // Check if user can post (100 free posts limit or premium)
    const postLimitCheck = await canUserPost(user.id)
    if (!postLimitCheck.canPost) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indiankonnect.com'
      await message.reply(
        `❌ ${postLimitCheck.reason}\n\nUpgrade to Premium: ${appUrl}/pricing`
      )
      return
    }

    // Extract message text (remove "post" or "konnect" prefix)
    let messageText = message.body
      .replace(/^(post|konnect)\s+/i, '')
      .trim()

    // Sanitize message text
    messageText = sanitizeMessage(messageText)

    // Handle forwarded messages
    if (isForwarded && messageText) {
      messageText = `Forwarded: ${messageText}`
    }

    // Download and upload media if present
    let imageUrls: string[] = []
    if (hasMedia) {
      try {
        const media = await message.downloadMedia()
        if (media && media.mimetype?.startsWith('image/')) {
          // Upload to Supabase Storage
          const uploadResult = await uploadImage(
            media.data,
            `whatsapp-${Date.now()}.${media.mimetype.split('/')[1] || 'jpg'}`,
            media.mimetype
          )

          if (uploadResult.success && uploadResult.url) {
            imageUrls = [uploadResult.url]
            messageText += '\n[Image attached]'
          } else {
            // Inform user if image upload fails, but continue with text-only post
            await message.reply(
              `⚠️ Image could not be uploaded: ${uploadResult.error || 'Unknown error'}. Creating post without image.`
            )
          }
        }
      } catch (error) {
        console.error('Error downloading/uploading media:', error)
        await message.reply(
          '⚠️ Image could not be processed. Creating post without image.'
        )
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
        'Sorry, I couldn\'t parse your message. Please include: category, description, and price (if applicable).\n\nExample: post Room available in Brampton, ₹650/month, veg only'
      )
      return
    }

    // Clamp price to database limit before validation
    const MAX_PRICE = 99999999.99
    if (parsedPost.price !== undefined && parsedPost.price !== null) {
      if (parsedPost.price > MAX_PRICE) {
        await message.reply(
          `❌ Price is too large (${parsedPost.price.toLocaleString()}). Maximum allowed is ${MAX_PRICE.toLocaleString()}. Please adjust your price.`
        )
        return
      }
      // Round to 2 decimal places to match database precision
      parsedPost.price = Math.round(parsedPost.price * 100) / 100
    }

    // Validate parsed post data
    const validation = validatePostData({
      category: parsedPost.category,
      title: parsedPost.title,
      description: parsedPost.description,
      price: parsedPost.price,
      currency: parsedPost.currency,
      gender_filter: parsedPost.gender_filter,
    })

    if (!validation.valid) {
      await message.reply(
        `❌ Validation error:\n${validation.errors.join('\n')}\n\nPlease check your message and try again.`
      )
      return
    }

    // Get or set user's city using improved city matcher
    let cityId = user.city_id
    if (!cityId && parsedPost.city) {
      const matchedCityId = await matchCity(parsedPost.city)
      if (matchedCityId) {
        cityId = matchedCityId
        await supabase
          .from('users')
          .update({ city_id: matchedCityId })
          .eq('id', user.id)
      }
    }

    // Ensure price is within database limits and properly formatted
    let finalPrice: number | null = null
    if (parsedPost.price !== undefined && parsedPost.price !== null) {
      // Double-check price is within limits and round to 2 decimal places
      finalPrice = Math.min(Math.max(0, parsedPost.price), MAX_PRICE)
      finalPrice = Math.round(finalPrice * 100) / 100
    }

    // Create post in Supabase (pending approval)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        category: parsedPost.category,
        title: parsedPost.title,
        description: parsedPost.description,
        price: finalPrice,
        currency: parsedPost.currency || 'INR',
        images: imageUrls,
        city_id: cityId,
        veg_only: parsedPost.veg_only || false,
        gender_filter: parsedPost.gender_filter || 'both',
        is_anonymous: false,
        is_premium: user.is_premium || false,
        is_verified_owner: user.is_verified || false,
        is_active: true, // Auto-approve bot posts (set to false if you want admin approval)
      })
      .select()
      .single()

    if (postError || !post) {
      console.error('Error creating post:', postError)
      
      // Provide specific error messages for common issues
      let errorMessage = 'Failed to create post. Please try again later.'
      
      if (postError?.code === '22003' || postError?.message?.includes('numeric field overflow')) {
        errorMessage = '❌ Price is too large. Maximum allowed price is ₹99,999,999.99. Please adjust your price and try again.'
      } else if (postError?.code === '42501') {
        errorMessage = '❌ Permission error. Please contact support if this persists.'
      } else if (postError?.message) {
        errorMessage = `❌ Error: ${postError.message}`
      }
      
      await message.reply(errorMessage)
      return
    }

    // Rate limit was already incremented in checkAndIncrementRateLimit

    // Send success message
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indiankonnect.com'
    const postLink = `${appUrl}/posts/${post.id}`
    const remainingPosts = rateLimitCheck.remaining || 0
    const freePostsRemaining = postLimitCheck.freePostsRemaining

    let reply = `✅ Post created successfully!\n\n📱 View your post:\n${postLink}\n\n`
    
    if (freePostsRemaining !== undefined) {
      reply += `🆓 Free posts remaining: ${freePostsRemaining}\n`
    }
    
    reply += `📅 Posts remaining today: ${remainingPosts}\n\n`
    reply += `⏳ Your post is pending admin approval and will be visible soon.\n\n`
    reply += `Share this link with others!`

    await message.reply(reply)
    logInfo('Post created successfully', { postId: post.id, phoneNumber })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logException(
      error instanceof Error ? error : new Error(errorMessage),
      'Error processing WhatsApp message',
      { phoneNumber }
    )
    
    // Provide more specific error messages
    if (errorMessage.includes('rate limit')) {
      await message.reply(
        '❌ Rate limit error. Please try again later.'
      )
    } else if (errorMessage.includes('database') || errorMessage.includes('Supabase')) {
      await message.reply(
        '❌ Database error. Please try again in a few moments.'
      )
    } else if (errorMessage.includes('parse') || errorMessage.includes('OpenAI')) {
      await message.reply(
        '❌ Could not understand your message. Please try rephrasing with more details.'
      )
    } else {
      await message.reply(
        `❌ Error: ${errorMessage}. Please try again later or contact support.`
      )
    }
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