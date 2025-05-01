"use client";

import React, { createContext, useContext, useState } from 'react';

// Define the context type
type MapSearchContextType = {
  selectedStoreId: string | null;
  setSelectedStoreId: (id: string | null) => void;
  storeName: string | null;
  setStoreName: (name: string | null) => void;
  isOpen: boolean | null;
  setIsOpen: (isOpen: boolean | null) => void;
  selectedProductName: string | null;
  setSelectedProductName: (name: string | null) => void;
};

// Create the context with default values
const MapSearchContext = createContext<MapSearchContextType>({
  selectedStoreId: null,
  setSelectedStoreId: () => {},
  storeName: null,
  setStoreName: () => {},
  isOpen: null,
  setIsOpen: () => {},
  selectedProductName: null,
  setSelectedProductName: () => {},
});

// Custom hook to use the context
export const useMapSearch = () => useContext(MapSearchContext);

// Provider component
export const MapSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  // Create a custom event when store is selected from search
  const handleSetSelectedStoreId = (id: string | null) => {
    setSelectedStoreId(id);
    
    // If id is null, also reset other store-related state
    if (id === null) {
      setStoreName(null);
      setIsOpen(null);
      setSelectedProductName(null);
    }
    
    // Dispatch a custom event that map-component will listen for
    if (typeof window !== 'undefined' && id !== null) {
      const storeSelectedEvent = new CustomEvent('storeSelected', {
        detail: { storeId: id }
      });
      window.dispatchEvent(storeSelectedEvent);
    }
  };

  return (
    <MapSearchContext.Provider 
      value={{ 
        selectedStoreId, 
        setSelectedStoreId: handleSetSelectedStoreId,
        storeName,
        setStoreName,
        isOpen,
        setIsOpen,
        selectedProductName,
        setSelectedProductName
      }}
    >
      {children}
    </MapSearchContext.Provider>
  );
};