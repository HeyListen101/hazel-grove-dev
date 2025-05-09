import { render, screen } from '@testing-library/react'
import { ErrorDisplay } from '@/components/error-display'

describe('ErrorDisplay', () => {
  it('renders error message correctly', () => {
    render(<ErrorDisplay message="Test error message" />)
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('does not render when message is null', () => {
    const { container } = render(<ErrorDisplay message={null} />)
    expect(container.firstChild).toBeNull()
  })
})