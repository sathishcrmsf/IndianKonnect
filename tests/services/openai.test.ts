import { describe, it, expect } from 'vitest'
import { parseWhatsAppMessage } from '@/lib/services/openai'

describe('parseWhatsAppMessage', () => {
  it('should parse a room rental message', async () => {
    const message = 'Room available in Brampton, ₹650/month, veg only kitchen, female preferred'
    const result = await parseWhatsAppMessage(message)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('room_rent')
    expect(result?.title).toContain('Room')
    expect(result?.price).toBe(650)
    expect(result?.veg_only).toBe(true)
  })

  it('should parse a ride share message', async () => {
    const message = 'Ride share from Toronto to Montreal, leaving Friday, $50 per person'
    const result = await parseWhatsAppMessage(message)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('ride_share')
  })

  it('should handle messages without price', async () => {
    const message = 'Looking for a roommate in downtown Toronto'
    const result = await parseWhatsAppMessage(message)
    
    expect(result).not.toBeNull()
    expect(result?.description).toBe(message)
  })
})

