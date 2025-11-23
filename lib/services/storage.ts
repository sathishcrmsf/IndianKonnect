/**
 * Supabase Storage service for uploading images
 */

import { getSupabaseClient } from '../supabase/supabase-bot.js'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET_NAME = 'post-images'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  fileData: Buffer | string,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient()

    // Validate file size (if Buffer)
    if (Buffer.isBuffer(fileData)) {
      if (fileData.length > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: `Image is too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        }
      }
    } else if (typeof fileData === 'string') {
      // Base64 string - estimate size
      const base64Size = (fileData.length * 3) / 4
      if (base64Size > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: `Image is too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        }
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = fileName.split('.').pop() || 'jpg'
    const uniqueFileName = `${timestamp}-${randomStr}.${extension}`

    // Convert base64 to Buffer if needed
    let buffer: Buffer
    if (typeof fileData === 'string') {
      // Remove data URL prefix if present
      const base64Data = fileData.includes(',') 
        ? fileData.split(',')[1] 
        : fileData
      buffer = Buffer.from(base64Data, 'base64')
    } else {
      buffer = fileData
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFileName)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to get image URL',
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the image',
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  images: Array<{ data: Buffer | string; fileName: string; mimeType: string }>
): Promise<Array<UploadResult>> {
  const results = await Promise.all(
    images.map((img) => uploadImage(img.data, img.fileName, img.mimeType))
  )
  return results
}

