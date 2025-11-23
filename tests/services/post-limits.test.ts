import { describe, it, expect, vi } from 'vitest'
import { canUserPost } from '@/lib/services/post-limits'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('canUserPost', () => {
  it('should allow posting when under free limit', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        count: vi.fn().mockResolvedValue({ count: 50, error: null }),
      }),
    })

    vi.mocked(supabase.from).mockReturnValue(mockFrom() as any)

    const result = await canUserPost('user-123')
    
    expect(result.canPost).toBe(true)
    expect(result.freePostsRemaining).toBe(50)
  })

  it('should require premium after free limit', async () => {
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue({ count: 100, error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { is_premium: false },
              error: null,
            }),
          }),
        }),
      })

    vi.mocked(supabase.from).mockImplementation(mockFrom as any)

    const result = await canUserPost('user-123')
    
    expect(result.canPost).toBe(false)
    expect(result.reason).toContain('Free posts limit reached')
  })
})

