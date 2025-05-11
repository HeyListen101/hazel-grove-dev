import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant', () => {
    const { container } = render(<Button>Click me</Button>)
    expect(container.firstChild).toHaveClass('bg-primary')
  })
  
  it('renders with outline variant', () => {
    const { container } = render(<Button variant="outline">Outline Button</Button>)
    expect(container.firstChild).toHaveClass('border')
  })
  
  it('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#">Link Button</a>
      </Button>
    )
    
    expect(screen.getByRole('link')).toHaveTextContent('Link Button')
  })
  
  it('applies disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})