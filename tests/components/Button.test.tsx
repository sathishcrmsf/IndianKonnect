import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies WhatsApp green variant by default', () => {
    render(<Button>Test</Button>)
    const button = screen.getByText('Test')
    expect(button).toHaveClass('bg-whatsapp-green')
  })

  it('applies outline variant when specified', () => {
    render(<Button variant="outline">Test</Button>)
    const button = screen.getByText('Test')
    expect(button).toHaveClass('border')
  })
})

