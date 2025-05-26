'use client';

import React from 'react';
import StoreCard from './ui/store-card';
import { useMapSearch } from './map-search-context';

export default function SlidingStoreCard() {
  const { selectedStoreId, storeName } = useMapSearch();
  
  return (
    <div className={`
      absolute top-[16.5vw] left-0 h-[60vh] w-96 bg-white shadow-lg z-50 rounded-[15px]
      transform transition-transform duration-300 ease-in-out
      ${selectedStoreId ? 'translate-x-8' : '-translate-x-full'}
      overflow-hidden
    `}>
      {selectedStoreId && (
        <StoreCard
          storeId={selectedStoreId}
          isSelected={!!selectedStoreId}
          storeName={storeName || 'Loading...'}
        />
      )}
    </div>
  );
}