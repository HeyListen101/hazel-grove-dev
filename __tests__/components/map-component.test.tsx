import { render, screen, fireEvent } from '@testing-library/react'
import MapComponent from '@/components/map-component'
import { createClient } from '@/utils/supabase/client'

// Mock the MapSearch context
jest.mock('@/components/map-search-context', () => ({
  useMapSearch: jest.fn(() => ({
    selectedStoreId: null,
    setSelectedStoreId: jest.fn(),
    storeName: '',
    setStoreName: jest.fn(),
    isOpen: false,
    setIsOpen: jest.fn(),
    selectedProductName: '',
    isMapSelectionInProgress: false,
    setIsMapSelectionInProgress: jest.fn(),
    isEventDispatchInProgress: false,
  })),
}))

// Mock the Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock the components used by MapComponent
jest.mock('@/components/store-component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="store-component">Store Component</div>),
}))

describe('MapComponent', () => {
  beforeEach(() => {
    // Mock the Supabase client
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: [], error: null }),
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
  
  it('renders the map component', () => {
    render(<MapComponent />)
    
    // Check if the main container is rendered
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})