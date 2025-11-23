import { describe, it, expect } from 'vitest'
import { formatTimeAgo, isNewPost } from '@/lib/utils'

describe('formatTimeAgo', () => {
  it('returns "just now" for recent dates', () => {
    const date = new Date(Date.now() - 30 * 1000) // 30 seconds ago
    expect(formatTimeAgo(date)).toBe('just now')
  })

  it('formats minutes ago', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    expect(formatTimeAgo(date)).toContain('m ago')
  })

  it('formats hours ago', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    expect(formatTimeAgo(date)).toContain('h ago')
  })
})

describe('isNewPost', () => {
  it('returns true for posts less than 24 hours old', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    expect(isNewPost(date)).toBe(true)
  })

  it('returns false for posts older than 24 hours', () => {
    const date = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    expect(isNewPost(date)).toBe(false)
  })
})

