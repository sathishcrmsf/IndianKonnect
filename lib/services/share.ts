/**
 * Share service for social media and WhatsApp sharing
 */

export interface ShareOptions {
  title: string
  text: string
  url: string
  hashtags?: string[]
}

/**
 * Share to native share dialog
 */
export async function shareNative(options: ShareOptions): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    })
    return true
  } catch (error) {
    // User cancelled or error
    return false
  }
}

/**
 * Share to WhatsApp
 */
export function shareWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encodedText}`, "_blank")
}

/**
 * Share to Facebook
 */
export function shareFacebook(url: string): void {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
}

/**
 * Share to Twitter/X
 */
export function shareTwitter(text: string, url: string, hashtags?: string[]): void {
  const hashtagsStr = hashtags ? hashtags.join(",") : ""
  const tweetText = `${text} ${url}${hashtagsStr ? ` #${hashtagsStr}` : ""}`
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank")
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.opacity = "0"
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand("copy")
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Generate launch message template
 */
export function generateLaunchMessage(appUrl: string, memberCount: number): string {
  return `🔥 *IndianKonnect.com is finally here!*  

No more scrolling 1000 messages in WhatsApp groups!  

One app for:  
✅ Room / PG (with price comparison)  
✅ Ride shares  
✅ Grocery & restaurant deals  
✅ Parcel from India  
✅ Jobs & referrals  

100% safe — verified users only  
Post in 5 seconds → reaches thousands instantly  

👉 Join free: ${appUrl}  

First 500 lifetime members get it for just ₹299 / $19 forever!  
(Already ${memberCount}+ joined in 2 hours)

Forward to your city group and help everyone! 🇮🇳`
}

/**
 * Generate post share message
 */
export function generatePostShareMessage(
  postTitle: string,
  postUrl: string,
  price?: string
): string {
  return `Check out this post on IndianKonnect:

${postTitle}${price ? ` - ${price}` : ""}

View details: ${postUrl}

Join IndianKonnect - One safe place for Indians abroad! 🇮🇳`
}

