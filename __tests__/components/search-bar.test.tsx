import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/search-bar'
import { createClient } from '@/utils/supabase/client'

// Mock the MapSearch context
jest.mock('@/components/map-search-context', () => ({
  useMapSearch: jest.fn(() => ({
    setStoreName: jest.fn(),
    setIsOpen: jest.fn(),
    setSelectedStoreId: jest.fn(),
  })),
}))

// Mock the Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('SearchBar', () => {
  beforeEach(() => {
    // Mock the Supabase client
    const mockSupabase = {
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    }
    
    // @ts-ignore - Partial mock implementation
    createClient.mockReturnValue(mockSupabase)
  })
  
  it('renders the search input', () => {
    render(<SearchBar />)
    
    // Check if the search input is rendered
    expect(screen.getByPlaceholderText(/search stores or products/i)).toBeInTheDocument()
  })
  
  it('handles input changes', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const searchInput = screen.getByPlaceholderText(/search stores or products/i)
    await user.type(searchInput, 'test')
    
    expect(searchInput).toHaveValue('test')
  })
})