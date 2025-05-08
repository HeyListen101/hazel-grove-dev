"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useMapSearch } from '@/components/map-search-context';

type SearchResult = {
  productName: string;
  storeName: string;
  price: string;
  storeId: string;
};

const supabase = createClient();

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setSelectedStoreId, setStoreName, setIsOpen } = useMapSearch();

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
  
    setIsSearching(true);
  
    try {
      let combinedResults: SearchResult[] = [];
      
      // Determine search type based on term
      if (term.length <= 3) {
        // For short terms, only search products
        const { data: products, error: productError } = await supabase
          .from('product')
          .select(`
            *,
            productstatus:productstatus(*),
            store:store(*)
          `)
          .ilike('name', `%${term}%`);
    
        if (productError) {
          console.log('Error fetching products:', productError);
        }
    
        if (products && products.length > 0) {
          const productResults = products.map((item) => ({
            productName: item.name,
            storeName: item.store?.name || 'Unknown Store',
            price: `Php ${item.productstatus?.price ?? 'N/A'}`,
            storeId: item.store?.storeid || '', // Make sure we're using storeid consistently
          }));
          
          combinedResults = [...productResults];
        }
      } else {
        // For longer terms, search both products and stores
        
        // First, search products
        const { data: products, error: productError } = await supabase
          .from('product')
          .select(`
            *,
            productstatus:productstatus(*),
            store:store(*)
          `)
          .ilike('name', `%${term}%`);
    
        if (productError) {
          console.log('Error fetching products:', productError);
        }
    
        if (products && products.length > 0) {
          const productResults = products.map((item) => ({
            productName: item.name,
            storeName: item.store?.name || 'Unknown Store',
            price: `Php ${item.productstatus?.price ?? 'N/A'}`,
            storeId: item.store?.storeid || '', // Make sure we're using storeid consistently
          }));
          
          combinedResults = [...productResults];
        }
        
        // Then, search stores
        const { data: stores, error: storeError } = await supabase
          .from('store')
          .select('*')
          .ilike('name', `%${term}%`);
    
        if (storeError) {
          console.log('Error fetching stores:', storeError);
        }
    
        if (stores && stores.length > 0) {
          for (const store of stores) {
            const { data: storeItems, error } = await supabase
              .from('product')
              .select(`
                *,
                productstatus:productstatus(*)
              `)
              .eq('brand', store.name);
    
            if (error) {
              console.log(`Error fetching products for store ${store.name}:`, error);
              continue;
            }
    
            if (storeItems && storeItems.length > 0) {
              const items = storeItems.map((item) => ({
                productName: item.name,
                storeName: store.name,
                price: `Php ${item.productstatus?.price ?? 'N/A'}`,
                storeId: store.storeid, // Using storeid consistently
              }));
    
              combinedResults = [...combinedResults, ...items];
            } else {
              // If no products found, still add the store as a result
              combinedResults.push({
                productName: 'View all products',
                storeName: store.name,
                price: '',
                storeId: store.storeid, // Using storeid consistently
              });
            }
          }
        }
      }
  
      // De-duplicate by (productName + storeName)
      const seen = new Set();
      const uniqueResults = combinedResults.filter((item) => {
        const key = `${item.productName}-${item.storeName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  
      console.log('Final unique search results:', uniqueResults);
      setSearchResults(uniqueResults);
  
    } catch (error) {
      console.log('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);

    if (newTerm.trim()) {
      handleSearch(newTerm);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Handle result click - open the store component
    const handleResultClick = async (result: SearchResult) => {
      console.log('Selected result:', result); // Debug the selected result
      
      // Make sure we're using the correct ID for the store
      const storeId = result.storeId;
      
      if (!storeId) {
        console.log('Store ID is missing from the search result');
        return;
      }
      
      try {
        const store = await fetchStoreData(storeId);
        
        if (store) {
          console.log('Fetched store data:', store); // Debug the fetched store
          
          // Update the context with the store information
          setStoreName(store.name || result.storeName);
          setIsOpen(store.storestatus?.isopen || false);
          setSelectedStoreId(store.storeid);
        } else {
          console.log('Store not found for ID:', storeId);
        }
      } catch (error) {
        console.log('Error processing search result:', error);
      }
    
      // Clear search UI
      setSearchTerm('');
      setSearchResults([]);
    };

  const fetchStoreData = async (id: string) => {
    try {
      setIsSearching(true);
  
      const { data: store, error } = await supabase
        .from('store')
        .select(`
          *,
          storestatus:storestatus(*)
        `)
        .eq('storeid', id)
        .single();
  
      if (error) {
        console.log('Error fetching store:', error);
        return null;
      }
  
      return store;
    } catch (error) {
      console.log('Unexpected error fetching store:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <>
      <div className="relative max-w-md w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search stores or products"
            className={`w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-white ${(isSearching || searchResults.length > 0) ? 'rounded-t-[75px] shadow-sm' : 'rounded-[75px] shadow-sm'} focus:outline-none focus:ring-0`}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchTerm);
              }
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 stroke-2" />
          </div>
        </div>

        {/* Search Results */}
        {(isSearching || searchResults.length > 0) && (
          <div className="absolute top-full left-0 right-0 w-full bg-white rounded-b-md shadow-lg z-50 overflow-hidden border-x border-b border-gray-200">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              <ul 
                className="divide-y divide-gray-200 max-h-[363px] overflow-y-auto
                  [&::-webkit-scrollbar]:w-1
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-gray-100
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-track]:bg-[#F0F0F0]
                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-400
                "
              >
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base font-medium text-gray-800">{result.storeName}</div>
                        <div className="text-sm text-gray-600 mt-1">{result.productName}</div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">{result.price}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;