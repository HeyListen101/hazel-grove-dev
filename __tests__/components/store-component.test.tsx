import { render, screen, fireEvent } from '@testing-library/react'
import StoreComponent from '@/components/store-component'
import { createClient } from '@/utils/supabase/client'

// Mock the MapSearch context
jest.mock('@/components/map-search-context', () => ({
  useMapSearch: jest.fn(() => ({
    isOpen: false,
    setIsOpen: jest.fn(),
  })),
}))

// Mock the Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('StoreComponent', () => {
  beforeEach(() => {
    // Mock the Supabase client
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      }),
      removeChannel: jest.fn(),
    }
    
    // @ts-ignore - Partial mock implementation
    createClient.mockReturnValue(mockSupabase)
  })
  
  it('renders the store component with store name', () => {
    render(<StoreComponent storeId="store-123" isSelected={true} storeName="Test Store" />)
    
    // Check if the store name is rendered
    expect(screen.getByText('Test Store')).toBeInTheDocument()
  })
  
  it('shows loading state when fetching products', () => {
    render(<StoreComponent storeId="store-123" isSelected={true} storeName="Test Store" />)
    
    // Check for loading indicator (this depends on your implementation)
    // This is a placeholder test - adjust based on your actual loading UI
    expect(screen.getByText(/Test Store/i)).toBeInTheDocument()
  })
})