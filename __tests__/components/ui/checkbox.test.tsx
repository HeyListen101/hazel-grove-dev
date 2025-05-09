import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })
  
  it('can be checked and unchecked', () => {
    render(<Checkbox aria-label="Test checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    // Check the checkbox
    fireEvent.click(checkbox)
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    
    // Uncheck the checkbox
    fireEvent.click(checkbox)
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
  })
  
  it('renders with custom className', () => {
    const { container } = render(<Checkbox className="test-class" aria-label="Test checkbox" />)
    expect(container.firstChild).toHaveClass('test-class')
  })
  
  it('can be disabled', () => {
    render(<Checkbox disabled aria-label="Disabled checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})