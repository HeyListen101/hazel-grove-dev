"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Store } from './map-component'

// Define the context type
type MapSearchContextType = {
  selectedStoreId: string | null;
  setSelectedStoreId: (id: string | null) => void; // Keep existing signature
  storeName: string | null;
  setStoreName: (name: string | null) => void;
  isOpen: boolean | null;
  setIsOpen: (isOpen: boolean | null) => void;
  selectedProductName: string | null; // Assuming this is used elsewhere
  setSelectedProductName: (name: string | null) => void;

  storeDetails: Store | null; // Use your Store type
  setStoreDetails: (details: Store | null) => void; // Actual setter

  isMapSelectionInProgress: boolean;
  setIsMapSelectionInProgress: (inProgress: boolean) => void;
  isEventDispatchInProgress: boolean; // Keep if your event logic needs it
};

// Create the context with default values

const MapSearchContext = createContext<MapSearchContextType | undefined>(undefined);

export const useMapSearch = () => {
  const context = useContext(MapSearchContext);
  if (context === undefined) {
    throw new Error('useMapSearch must be used within a MapSearchProvider');
  }
  return context;
};

// Provider component
export const MapSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStoreIdState, setSelectedStoreIdState] = useState<string | null>(null);
  const [storeNameState, setStoreNameState] = useState<string | null>(null);
  const [isOpenState, setIsOpenState] = useState<boolean | null>(null);
  const [selectedProductNameState, setSelectedProductNameState] = useState<string | null>(null);
  const [storeDetailsState, setStoreDetailsState] = useState<Store | null>(null); // Typed state
  const [isMapSelectionInProgressState, setIsMapSelectionInProgressState] = useState<boolean>(false);
  const isEventDispatchInProgressRef = useRef<boolean>(false);

  // Create a custom event when store is selected from search
  const handleSetSelectedStoreId = useCallback((id: string | null) => {
    console.log("Context: handleSetSelectedStoreId called with:", id, "isMapSelectionInProgress:", isMapSelectionInProgressState);
    
    // First, update the state
    setSelectedStoreIdState(id);

    if (id === null) {
      setStoreNameState(null);
      setIsOpenState(null);
      setStoreDetailsState(null); // Clear details on deselect
  }
  setSelectedStoreIdState(id);

  // Event dispatch logic (ensure 'origin' is handled if you re-introduce it)
  if (
    typeof window !== 'undefined' &&
    id !== null &&
    !isMapSelectionInProgressState && // Use state here
    id !== selectedStoreIdState && // Compare with previous state value if needed
    !isEventDispatchInProgressRef.current
  ) {
    isEventDispatchInProgressRef.current = true;
    const storeSelectedEvent = new CustomEvent('storeSelected', {
      detail: { storeId: id /*, origin: 'search' // if you track origin */ }
    });
    window.dispatchEvent(storeSelectedEvent);
    setTimeout(() => {
      isEventDispatchInProgressRef.current = false;
    }, 0);
  }
  if (isMapSelectionInProgressState) { // Use state here
    setIsMapSelectionInProgressState(false);
  }
}, [isMapSelectionInProgressState, selectedStoreIdState]); // Add selectedStoreIdState to deps
  
return (
  <MapSearchContext.Provider
    value={{
      selectedStoreId: selectedStoreIdState,
      setSelectedStoreId: handleSetSelectedStoreId,
      storeName: storeNameState,
      setStoreName: setStoreNameState,
      isOpen: isOpenState,
      setIsOpen: setIsOpenState,
      selectedProductName: selectedProductNameState,
      setSelectedProductName: setSelectedProductNameState,
      storeDetails: storeDetailsState,
      setStoreDetails: setStoreDetailsState, // Provide the actual setter
      isMapSelectionInProgress: isMapSelectionInProgressState,
      setIsMapSelectionInProgress: setIsMapSelectionInProgressState,
      isEventDispatchInProgress: isEventDispatchInProgressRef.current,
    }}
  >
    {children}
  </MapSearchContext.Provider>
  );
};