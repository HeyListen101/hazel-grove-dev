"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

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
  // Add a flag to prevent event dispatch when selection comes from map component
  isMapSelectionInProgress: boolean;
  setIsMapSelectionInProgress: (inProgress: boolean) => void;
  // Add a flag to prevent event handling in the map component
  isEventDispatchInProgress: boolean;
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
  isMapSelectionInProgress: false,
  setIsMapSelectionInProgress: () => {},
  isEventDispatchInProgress: false,
});

// Custom hook to use the context
export const useMapSearch = () => useContext(MapSearchContext);

// Provider component
export const MapSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStoreIdState, setSelectedStoreIdState] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [isMapSelectionInProgress, setIsMapSelectionInProgress] = useState<boolean>(false);
  const isEventDispatchInProgressRef = useRef<boolean>(false);

  // Create a custom event when store is selected from search
  const handleSetSelectedStoreId = useCallback((id: string | null) => {
    console.log("Context: handleSetSelectedStoreId called with:", id, "isMapSelectionInProgress:", isMapSelectionInProgress);
    
    // First, update the state
    setSelectedStoreIdState(id);

    if (id === null) {
      setStoreName(null);
      setIsOpen(null);
    }
    
    // Only dispatch event if:
    // 1. Not from map component
    // 2. ID is different from current
    // 3. ID is not null
    // 4. Not already dispatching an event
    if (
      typeof window !== 'undefined' && 
      id !== null && 
      !isMapSelectionInProgress && 
      id !== selectedStoreIdState &&
      !isEventDispatchInProgressRef.current
    ) {
      console.log("Context: Dispatching 'storeSelected' event for:", id);
      
      // Set flag to prevent recursive event handling
      isEventDispatchInProgressRef.current = true;
      
      // Dispatch the event
      const storeSelectedEvent = new CustomEvent('storeSelected', {
        detail: { storeId: id }
      });
      window.dispatchEvent(storeSelectedEvent);
      
      // Reset the flag after a short delay to ensure event handling is complete
      setTimeout(() => {
        isEventDispatchInProgressRef.current = false;
      }, 0);
    }

    // Reset the map selection flag if it was set
    if (isMapSelectionInProgress) {
      console.log("Context: Resetting isMapSelectionInProgress to false");
      setIsMapSelectionInProgress(false);
    }
  }, [isMapSelectionInProgress, selectedStoreIdState]);
  
  return (
    <MapSearchContext.Provider
      value={{
        selectedStoreId: selectedStoreIdState,
        setSelectedStoreId: handleSetSelectedStoreId,
        storeName,
        setStoreName,
        isOpen,
        setIsOpen,
        selectedProductName,
        setSelectedProductName,
        isMapSelectionInProgress,
        setIsMapSelectionInProgress,
        isEventDispatchInProgress: isEventDispatchInProgressRef.current
      }}
    >
      {children}
    </MapSearchContext.Provider>
  );
};