import { render } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    const { container } = render(<Badge>Test Badge</Badge>)
    expect(container.firstChild).toHaveClass('inline-flex')
  })
  
  it('renders with custom variant', () => {
    const { container } = render(<Badge variant="outline">Outline Badge</Badge>)
    expect(container.firstChild).toHaveClass('border')
  })
  
  it('applies custom className', () => {
    const { container } = render(<Badge className="test-class">Custom Class</Badge>)
    expect(container.firstChild).toHaveClass('test-class')
  })
})