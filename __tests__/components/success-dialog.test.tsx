import { render, screen, fireEvent, act } from '@testing-library/react'
import { SuccessDialog } from '@/components/success-dialog'
import { useSearchParams, useRouter } from 'next/navigation'

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}))

// Mock URL and window.location
const mockUrl = {
  searchParams: {
    delete: jest.fn(),
  },
  toString: jest.fn().mockReturnValue('http://localhost:3000'),
}

global.URL = jest.fn(() => mockUrl) as any;

describe('SuccessDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
      },
      writable: true,
    });
  });
  
  it('renders nothing when there is no success message', () => {
    // Mock the useSearchParams to return no success message
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    })
    
    (useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
    })
    
    const { container } = render(<SuccessDialog />)
    
    // The component should not render anything
    expect(container).toBeEmptyDOMElement()
  })
  
  it('renders the success dialog with the message from URL', () => {
    // Mock the useSearchParams to return a success message
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('Operation completed successfully'),
    })
    
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    })
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=Operation%20completed%20successfully',
      },
      writable: true,
    })
    
    render(<SuccessDialog />)
    
    // Check if the success message is rendered
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    
    // Check if the close button is rendered
    expect(screen.getByText('Close')).toBeInTheDocument()
    
    // Verify router.replace was called to update the URL
    expect(mockReplace).toHaveBeenCalled()
  })
  
  it('closes the dialog when the close button is clicked', () => {
    // Mock the useSearchParams to return a success message
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('Operation completed successfully'),
    })
    
    (useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
    })
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=Operation%20completed%20successfully',
      },
      writable: true,
    })
    
    render(<SuccessDialog />)
    
    // Click the close button
    fireEvent.click(screen.getByText('Close'))
    
    // The component should not be visible anymore
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
  })
})