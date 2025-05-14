// __tests__/search-bar.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from "@/components/search-bar";
import { MapSearchProvider } from '@/components/map-search-context'; // Adjust path

// --- Mocks ---

// Mock Supabase client
const mockSupabaseFunctions = {
  productSearchByName: jest.fn(),
  storeSearchByName: jest.fn(),
  productsByStoreBrand: jest.fn(), // For product table, eq('brand', store.name)
  fetchStoreById: jest.fn(),       // For store table, eq('storeid', id).single()
};

jest.mock('@/utils/supabase/client', () => ({ // Adjust path to your supabase client util
  createClient: () => ({
    from: jest.fn((tableName: string) => {
      const instance: { [key: string]: any } = { // Using an index signature for flexibility
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn((column: string, pattern: string) => {
          if (tableName === 'product' && column === 'name') {
            return mockSupabaseFunctions.productSearchByName(pattern);
          }
          if (tableName === 'store' && column === 'name') {
            return mockSupabaseFunctions.storeSearchByName(pattern);
          }
          console.warn(`Mocked ilike for ${tableName}.${column} not specifically configured, returning empty.`);
          return Promise.resolve({ data: [], error: null });
        }),
        eq: jest.fn((column: string, value: any) => {
          instance.single = jest.fn(() => { // Define single on the current instance
            if (tableName === 'store' && column === 'storeid') {
              return mockSupabaseFunctions.fetchStoreById(value);
            }
            console.warn(`Mocked eq().single() for ${tableName}.${column} not specifically configured, returning empty.`);
            return Promise.resolve({ data: null, error: null });
          });

          // Make the object returned by eq() thenable for cases like `await ...eq()`
          instance.then = (onfulfilled: any, onrejected: any) => {
            if (tableName === 'product' && column === 'brand') {
              return mockSupabaseFunctions.productsByStoreBrand(value).then(onfulfilled, onrejected);
            }
            console.warn(`Mocked awaitable eq() for ${tableName}.${column} not specifically configured, returning empty.`);
            return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected);
          };
          instance.catch = (onrejected: any) => { /* similar logic if needed for catch */ };
          return instance;
        }),
      };
      return instance;
    }),
  }),
}));

// Mock useMapSearch context hook
const mockSetSelectedStoreId = jest.fn();
const mockSetStoreName = jest.fn();
const mockSetIsOpen = jest.fn();
const mockSetSelectedProductName = jest.fn();
const mockSetIsMapSelectionInProgress = jest.fn();
const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');


jest.mock('@/components/map-search-context', () => { // Adjust path to your context
  const originalModule = jest.requireActual('@/components/map-search-context');
  return {
    ...originalModule,
    useMapSearch: () => ({
      selectedStoreId: null,
      storeName: null,
      isOpen: null,
      selectedProductName: null,
      isMapSelectionInProgress: false,
      isEventDispatchInProgress: false, // Assuming default for testing SearchBar
      setSelectedStoreId: mockSetSelectedStoreId,
      setStoreName: mockSetStoreName,
      setIsOpen: mockSetIsOpen,
      setSelectedProductName: mockSetSelectedProductName,
      setIsMapSelectionInProgress: mockSetIsMapSelectionInProgress,
    }),
  };
});


// --- Helper function to render with Provider ---
const renderSearchBar = () => {
  return render(
    <MapSearchProvider>
      <SearchBar />
    </MapSearchProvider>
  );
};

// --- Test Suite ---
describe('SearchBar', () => {
  beforeEach(() => {
    // Reset all mock function calls before each test
    mockSupabaseFunctions.productSearchByName.mockReset();
    mockSupabaseFunctions.storeSearchByName.mockReset();
    mockSupabaseFunctions.productsByStoreBrand.mockReset();
    mockSupabaseFunctions.fetchStoreById.mockReset();
    mockSetSelectedStoreId.mockReset();
    mockSetStoreName.mockReset();
    mockSetIsOpen.mockReset();
    mockSetSelectedProductName.mockReset();
    mockSetIsMapSelectionInProgress.mockReset();
    mockDispatchEvent.mockClear();

    // Default successful empty responses
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: [], error: null });
    mockSupabaseFunctions.storeSearchByName.mockResolvedValue({ data: [], error: null });
    mockSupabaseFunctions.productsByStoreBrand.mockResolvedValue({ data: [], error: null });
    mockSupabaseFunctions.fetchStoreById.mockResolvedValue({ data: null, error: null });
  });

  const typeSearchTerm = async (term: string) => {
    const searchInput = screen.getByPlaceholderText('Search stores or products');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: term } });
    });
    // Wait for any state updates and potential re-renders due to the immediate search
    await waitFor(() => {}); 
  };

  test('SEARCH-0001: Verify that product search returns correct results based on name (short term).', async () => {
    renderSearchBar();
    const searchTerm = 'Lap'; // <= 3 chars

    const mockProductData = [
      { name: 'Laptop Pro', store: { name: 'ElectroStore', storeid: 'store1' }, productstatus: { price: '1200' } },
    ];
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: mockProductData, error: null });

    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      expect(screen.getByText('ElectroStore')).toBeInTheDocument(); // Store name from product data
      expect(screen.getByText('Php 1200')).toBeInTheDocument();
    });
    expect(mockSupabaseFunctions.productSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.storeSearchByName).not.toHaveBeenCalled();
  });

  test('SEARCH-0002: Verify that store search returns correct results based on name (long term).', async () => {
    renderSearchBar();
    const searchTerm = 'Tech Shop'; // > 3 chars

    const mockStoreData = [{ name: 'Tech Shop Central', storeid: 'store2' }];
    // Products for "Tech Shop Central"
    const mockStoreProductsData = [ 
      { name: 'Charger', productstatus: { price: '25' } },
    ];
    // Products from direct search by term "Tech Shop"
    const mockDirectProductData = [
        { name: 'Tech Shop Branded Mouse', store: {name: 'AccessoryHub', storeid: 'storeAH'}, productstatus: { price: '15' } }
    ];


    mockSupabaseFunctions.storeSearchByName.mockResolvedValue({ data: mockStoreData, error: null });
    mockSupabaseFunctions.productsByStoreBrand.mockResolvedValue({ data: mockStoreProductsData, error: null });
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: mockDirectProductData, error: null });


    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      // Result from store search leading to product listing
      expect(screen.getByText('Tech Shop Central')).toBeInTheDocument();
      expect(screen.getByText('Charger')).toBeInTheDocument(); // Product from that store
      expect(screen.getByText('Php 25')).toBeInTheDocument();

      // Result from direct product search
      expect(screen.getByText('Tech Shop Branded Mouse')).toBeInTheDocument();
      expect(screen.getByText('AccessoryHub')).toBeInTheDocument();
      expect(screen.getByText('Php 15')).toBeInTheDocument();
    });

    expect(mockSupabaseFunctions.productSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.storeSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.productsByStoreBrand).toHaveBeenCalledWith(mockStoreData[0].name); // 'brand' is store.name
  });

  test('SEARCH-0002b: Store search shows "View all products" if store has no specific products.', async () => {
    renderSearchBar();
    const searchTerm = 'Empty Mart'; // > 3 chars

    const mockStoreData = [{ name: 'Empty Mart Central', storeid: 'storeE' }];
    mockSupabaseFunctions.storeSearchByName.mockResolvedValue({ data: mockStoreData, error: null });
    mockSupabaseFunctions.productsByStoreBrand.mockResolvedValue({ data: [], error: null }); // No products for this store
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: [], error: null }); // No direct product matches

    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      expect(screen.getByText('Empty Mart Central')).toBeInTheDocument();
      expect(screen.getByText('View all products')).toBeInTheDocument();
    });
    expect(mockSupabaseFunctions.productsByStoreBrand).toHaveBeenCalledWith(mockStoreData[0].name);
  });

  test('SEARCH-0003: Verify that combined search returns both products and stores correctly (long term).', async () => {
    renderSearchBar();
    const searchTerm = 'Gadget'; // > 3 chars

    const mockProductData = [
      { name: 'Gadget X1', store: { name: 'Innovatech', storeid: 'store3' }, productstatus: { price: '99' } },
    ];
    const mockStoreData = [{ name: 'Gadget World', storeid: 'store4' }];
    const mockStoreProductsData = [ // Products for Gadget World
      { name: 'Power Bank', productstatus: { price: '40' } },
    ];

    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: mockProductData, error: null });
    mockSupabaseFunctions.storeSearchByName.mockResolvedValue({ data: mockStoreData, error: null });
    mockSupabaseFunctions.productsByStoreBrand.mockResolvedValue({ data: mockStoreProductsData, error: null });

    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      // From direct product search
      expect(screen.getByText('Gadget X1')).toBeInTheDocument();
      expect(screen.getByText('Innovatech')).toBeInTheDocument();
      expect(screen.getByText('Php 99')).toBeInTheDocument();

      // From store search -> product listing
      expect(screen.getByText('Gadget World')).toBeInTheDocument();
      expect(screen.getByText('Power Bank')).toBeInTheDocument();
      expect(screen.getByText('Php 40')).toBeInTheDocument();
    });
    expect(mockSupabaseFunctions.productSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.storeSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.productsByStoreBrand).toHaveBeenCalledWith(mockStoreData[0].name);
  });

  test('SEARCH-0004: Verify that short search terms (≤3 chars) only search products.', async () => {
    renderSearchBar();
    const searchTerm = 'Key'; // 3 chars

    const mockProductData = [
      { name: 'Keyboard', store: { name: 'Office Supplies', storeid: 'store5' }, productstatus: { price: '50' } },
    ];
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: mockProductData, error: null });

    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });
    expect(mockSupabaseFunctions.productSearchByName).toHaveBeenCalledWith(`%${searchTerm}%`);
    expect(mockSupabaseFunctions.storeSearchByName).not.toHaveBeenCalled();
    expect(mockSupabaseFunctions.productsByStoreBrand).not.toHaveBeenCalled();
  });

  test('SEARCH-0005: Verify that empty search results are handled gracefully.', async () => {
    renderSearchBar();
    const searchTerm = 'NonExistentItemXYZ';

    // All Supabase calls will return empty data as per beforeEach default or specific mocks below
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ data: [], error: null });
    mockSupabaseFunctions.storeSearchByName.mockResolvedValue({ data: [], error: null });
    // productsByStoreBrand would only be called if storeSearchByName found stores, so not relevant here

    await typeSearchTerm(searchTerm);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument(); // No list items
  });
  
  test('SEARCH-0005b: Verify that search input cleared shows no results or loading.', async () => {
    renderSearchBar();
    const searchInput = screen.getByPlaceholderText('Search stores or products');
    
    // Type something to show results/loading
    mockSupabaseFunctions.productSearchByName.mockResolvedValueOnce({ data: [{ name: 'Test Product', store: { name: 'Test Store', storeid: 'ts1' }, productstatus: { price: '10' } }], error: null });
    await typeSearchTerm("Test");
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

    // Clear the input
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '' } });
    });
    await waitFor(() => {});


    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument(); // No list items
    expect(searchInput).toHaveValue('');
  });


  test('SEARCH-0006: Verify that selecting a search result correctly loads the store component (updates context).', async () => {
    renderSearchBar();
    const searchTerm = 'Unique Mart';

    const searchResultItem = {
      productName: 'Special Item', // or 'View all products'
      storeName: 'Unique Mart Deluxe',
      price: 'Php 75',
      storeId: 'storeUnique123',
    };
    // Mock the initial search that leads to this item being displayed
    // For simplicity, assume it's a direct product search result
    mockSupabaseFunctions.productSearchByName.mockResolvedValue({ 
      data: [{ 
        name: searchResultItem.productName, 
        store: { name: searchResultItem.storeName, storeid: searchResultItem.storeId }, 
        productstatus: { price: '75' } 
      }], 
      error: null 
    });
    
    // Mock the fetchStoreData call that happens on click
    const mockFetchedStore = {
      name: 'Unique Mart Deluxe (Fetched)',
      storeid: 'storeUnique123',
      storestatus: { isopen: true },
    };
    mockSupabaseFunctions.fetchStoreById.mockResolvedValue({ data: mockFetchedStore, error: null });

    await typeSearchTerm(searchTerm);

    let resultListItem: HTMLElement;
    await waitFor(() => {
      resultListItem = screen.getByText(searchResultItem.productName);
      expect(resultListItem).toBeInTheDocument();
      expect(screen.getByText(searchResultItem.storeName)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(resultListItem);
    });

    await waitFor(() => {
      expect(mockSupabaseFunctions.fetchStoreById).toHaveBeenCalledWith(searchResultItem.storeId);
    });
    
    expect(mockSetSelectedStoreId).toHaveBeenCalledWith(mockFetchedStore.storeid);
    expect(mockSetStoreName).toHaveBeenCalledWith(mockFetchedStore.name);
    expect(mockSetIsOpen).toHaveBeenCalledWith(mockFetchedStore.storestatus.isopen);

    // Check if search UI is cleared
    const searchInput = screen.getByPlaceholderText('Search stores or products') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument(); // Results list should be gone

    // Optional: Check for custom event dispatch if that's a critical part of your context
    // This depends on if your mock for useMapSearch still lets the event dispatch logic run
    // or if you've mocked `setSelectedStoreId` to not dispatch.
    // Given our `useMapSearch` mock directly provides mockSetSelectedStoreId, the original event dispatch won't run.
    // If testing the event, you'd need a more involved context mock or spy on window.dispatchEvent and ensure
    // the original setSelectedStoreId from the context is called.
    // For this test, verifying context setters are called is the primary goal.
  });
});