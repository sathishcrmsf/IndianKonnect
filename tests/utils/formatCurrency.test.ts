import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats INR currency with ₹ symbol', () => {
    expect(formatCurrency(1000, 'INR')).toBe('₹1,000')
  })

  it('formats USD currency with $ symbol', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000')
  })

  it('formats CAD currency with C$ symbol', () => {
    expect(formatCurrency(650, 'CAD')).toBe('C$650')
  })

  it('defaults to INR if currency not specified', () => {
    expect(formatCurrency(500)).toBe('₹500')
  })
})

