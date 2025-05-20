"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react'; // Import X icon
import { createClient } from '@/utils/supabase/client';
import { useMapSearch } from '@/components/map-search-context';

type SearchResult = {
  productName: string;
  storeName: string;
  price: string;
  storeId: string;
  score?: number;
  isViewAll?: boolean;
};

const supabase = createClient();
const DEBOUNCE_DELAY = 350;

const rankResults = (results: SearchResult[], queryTokens: string[]): SearchResult[] => {
  if (!queryTokens.length) return results;

  const ranked = results.map(result => {
    let score = 0;
    const productNameLower = result.productName.toLowerCase();
    const storeNameLower = result.storeName.toLowerCase();
    const uniqueMatchedTokens = new Set<string>();

    queryTokens.forEach(token => {
      if (productNameLower.includes(token)) uniqueMatchedTokens.add(token);
      if (storeNameLower.includes(token)) uniqueMatchedTokens.add(token);
    });
    score = uniqueMatchedTokens.size;
    if (!result.isViewAll && queryTokens.every(token => productNameLower.includes(token))) score += queryTokens.length * 2;
    if (queryTokens.every(token => storeNameLower.includes(token))) score += queryTokens.length;
    if (result.isViewAll) {
      if (!queryTokens.every(token => storeNameLower.includes(token))) score -= 100;
      else score -= 0.5;
    }
    return { ...result, score };
  });

  return ranked.sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    return (a.isViewAll ? 1 : 0) - (b.isViewAll ? 1 : 0);
  });
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { setSelectedStoreId, setStoreName, setIsOpen } = useMapSearch();

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input field

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchAttempted(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Search cleared by X button');
      abortControllerRef.current = null;
    }
    inputRef.current?.focus(); // Optionally focus the input after clearing
  };

  const handleSearch = async (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchAttempted(false);
      if (abortControllerRef.current) abortControllerRef.current.abort('Search term cleared');
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort('New search initiated');
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setIsSearching(true);
    setSearchAttempted(true);

    try {
      let combinedResults: SearchResult[] = [];
      const queryTokens = trimmedTerm.toLowerCase().split(/\s+/).filter(Boolean);

      const productSearchPromise = supabase
        .from('product')
        .select(`*, productstatus:productstatus(*), store:store!inner(*)`)
        .or(queryTokens.map(token => `name.ilike.%${token}%`).join(','))
        .limit(15)
        .abortSignal(signal);

      const storeSearchPromise = supabase
        .from('store')
        .select('name, storeid')
        .or(queryTokens.map(token => `name.ilike.%${token}%`).join(','))
        .limit(10)
        .abortSignal(signal);
      
      const [productNameMatches, storeNameMatches] = await Promise.all([
          productSearchPromise,
          storeSearchPromise
      ]);

      if (signal.aborted) { console.log('Initial searches aborted'); return; }

      if (productNameMatches.error) console.error('Error fetching products by name:', JSON.stringify(productNameMatches.error, null, 2));
      else if (productNameMatches.data) {
        const productResults = productNameMatches.data
          .filter(item => item.store)
          .map((item): SearchResult => ({
            productName: item.name,
            storeName: item.store.name,
            price: `Php ${item.productstatus?.price ?? 'N/A'}`,
            storeId: item.store.storeid,
            isViewAll: false,
        }));
        combinedResults.push(...productResults);
      }

      if (storeNameMatches.error) console.error('Error fetching stores by name:', JSON.stringify(storeNameMatches.error, null, 2));
      else if (storeNameMatches.data && storeNameMatches.data.length > 0) {
        const matchedStoreIds = storeNameMatches.data.map(s => s.storeid);
        const productNameOrConditions = queryTokens.map(token => `name.ilike.%${token}%`).join(',');
        const productsInStoresQuery = supabase
          .from('product')
          .select(`*, productstatus:productstatus(*), store:store!inner(*)`)
          .in('store', matchedStoreIds);
        if (productNameOrConditions) productsInStoresQuery.or(productNameOrConditions);
        const { data: productsInStores, error: productsInStoresError } = await productsInStoresQuery.limit(15).abortSignal(signal);

        if (signal.aborted) { console.log('Products in stores search aborted'); return; }

        if (productsInStoresError) console.error('Error fetching products in stores:', JSON.stringify(productsInStoresError, null, 2));
        else if (productsInStores) {
          const storeProductResults = productsInStores
            .filter(item => item.store)
            .map((item): SearchResult => ({
              productName: item.name,
              storeName: item.store.name,
              price: `Php ${item.productstatus?.price ?? 'N/A'}`,
              storeId: item.store.storeid,
              isViewAll: false,
          }));
          combinedResults.push(...storeProductResults);
        }
        storeNameMatches.data.forEach(store => {
          combinedResults.push({
            productName: 'View all products',
            storeName: store.name,
            price: '',
            storeId: store.storeid,
            isViewAll: true,
          });
        });
      }
      
      const seen = new Set<string>();
      const uniqueResults = combinedResults.filter((item) => {
        const key = `${item.productName === 'View all products' ? 'VIEW_ALL' : item.productName}-${item.storeName}-${item.storeId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const rankedAndSortedResults = rankResults(uniqueResults, queryTokens);
      setSearchResults(rankedAndSortedResults);
  
    } catch (error: any) {
      if (error.name === 'AbortError' || (error.message && error.message.includes('aborted'))) {
        console.log('Search operation was intentionally aborted.');
      } else {
        console.error('Error in handleSearch:', error);
        setSearchResults([]);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsSearching(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (newTerm.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        handleSearch(newTerm);
      }, DEBOUNCE_DELAY);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setSearchAttempted(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Input cleared');
        abortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounting');
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleResultClick = async (result: SearchResult) => {
    console.log('Selected result:', result);
    const storeId = result.storeId;
    if (!storeId) { console.log('Store ID is missing'); return; }
    
    try {
      const store = await fetchStoreData(storeId);
      if (store) {
        setStoreName(store.name || result.storeName);
        setIsOpen(store.storestatus?.isopen || false); // Assuming 'isopen' field in your storestatus table
        setSelectedStoreId(store.storeid);
      } else {
        console.log('Store not found for ID:', storeId);
      }
    } catch (error) {
      console.log('Error processing search result:', error);
    }
  
    setSearchTerm('');
    setSearchResults([]);
    setSearchAttempted(false);
    if (abortControllerRef.current) {
        abortControllerRef.current.abort('Result clicked');
        abortControllerRef.current = null;
    }
  };

  const fetchStoreData = async (id: string) => {
    try {
      const { data: store, error } = await supabase
        .from('store')
        .select(`*, storestatus:storestatus(isopen)`) // Fetching `isopen` from storestatus
        .eq('storeid', id)
        .single();
      if (error) { console.log('Error fetching store:', JSON.stringify(error, null, 2)); return null; }
      return store;
    } catch (error) {
      console.log('Unexpected error fetching store:', error);
      return null;
    }
  };

  const showResultsContainer = searchTerm.trim() !== '' && (isSearching || searchAttempted);
  
  return (
    <>
      <div className="relative max-w-md w-full">
        <div className="relative flex items-center"> {/* Flex container for input and X button */}
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 stroke-2" />
          </div>
          <input
            ref={inputRef} // Assign ref
            type="text"
            placeholder="Search stores or products"
            className={`w-full py-2 pl-10 pr-10 text-sm text-gray-700 bg-white ${ // Increased pr-10 for X button
              showResultsContainer ? 'rounded-t-md shadow-sm' : 'rounded-[75px] shadow-sm'
            } focus:outline-none focus:ring-0`}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
                handleSearch(searchTerm);
              }
            }}
          />
          {searchTerm && ( // Conditionally render X button
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 stroke-2" />
            </button>
          )}
        </div>

        {showResultsContainer && (
          <div className="absolute top-full left-0 right-0 w-full bg-white rounded-b-md shadow-lg z-50 overflow-hidden border-x border-b border-gray-200">
            {isSearching && searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : !isSearching && searchResults.length === 0 && searchAttempted ? (
              <div className="p-4 text-center text-gray-500">No products like that so far!</div>
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
                    key={`${result.storeId}-${result.productName}-${index}-${result.price}`}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base font-medium text-gray-800">{result.storeName}</div>
                        <div className="text-sm text-gray-600 mt-1">{result.productName}</div>
                      </div>
                      <div className="flex items-center">
                        {result.price && <span className="text-gray-600 mr-2">{result.price}</span>}
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
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;