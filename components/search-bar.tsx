"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type SearchResult = {
  productName: string;
  storeName: string;
  price: string;
};

const supabase = createClient();

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const { data: products, error: productError } = await supabase
        .from('product')
        .select(`
          *,
          productstatus:productstatus(*),
          store:store(*)
        `)
        .ilike('name', `%${term}%`);

      if (productError) {
        console.error('Error fetching products:', productError);
        setSearchResults([]);
        return;
      }

      let productResults: SearchResult[] = [];
      if (products && products.length > 0) {
        productResults = products.map((item) => ({
          productName: item.name,
          storeName: item.store.name,
          price: `Php ${item.productstatus.price}`,
        }));
      }

      // Store search only if user types more than 3 letters
      let storeProducts: SearchResult[] = [];
      if (term.length > 3) {
        const { data: stores, error: storeError } = await supabase
          .from('store')
          .select('name')
          .ilike('name', `%${term}%`);

        if (storeError) {
          console.error('Error fetching stores:', storeError);
        }

        if (stores && stores.length > 0) {
          // Try to find very closely matching store names
          const matchingStores = stores.filter((store) => {
            const storeNameLower = store.name.toLowerCase();
            const termLower = term.toLowerCase();
            return (
              storeNameLower.includes(termLower) ||
              termLower.includes(storeNameLower) ||
              storeNameLower.startsWith(termLower)
            );
          });

          for (const store of matchingStores) {
            const { data: storeItems, error } = await supabase
              .from('product')
              .select(`
                *,
                productstatus:productstatus(*)
              `)
              .eq('brand', store.name);

            if (error) {
              console.error(`Error fetching products for store ${store.name}:`, error);
              continue;
            }

            if (storeItems && storeItems.length > 0) {
              const items = storeItems.map((item) => ({
                productName: item.name,
                storeName: store.name,
                price: `Php ${item.productstatus.price}`,
              }));
              storeProducts = [...storeProducts, ...items];
            }
          }
        }
      }

      // Combine results — prioritize products first
      let combinedResults = [...productResults, ...storeProducts];

      // Remove duplicates: (productName + storeName unique)
      const seen = new Set();
      const uniqueResults = combinedResults.filter((item) => {
        const key = `${item.productName}-${item.storeName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log('Unique search results:', uniqueResults);
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching:', error);
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

  return (
    <div className="relative max-w-md w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search stores or products"
          className={`w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-white ${(isSearching || searchResults.length > 0) ? 'rounded-t-md shadow-md' : 'rounded-md shadow-md'} focus:outline-none focus:ring-0`}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchTerm);
            }
          }}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 stroke-2" />
        </div>
      </div>

      {/* Search Results */}
      {(isSearching || searchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 w-full bg-white rounded-b-md shadow-lg z-50 overflow-hidden border-x border-b border-gray-200">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[363] overflow-y-auto">
              {searchResults.map((result, index) => (
                <li
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
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
  );
};

export default SearchBar;
