'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ui/product-card';
import { createClient } from "@/utils/supabase/client";
import VisitaPlaceholder from './visita-placeholder';

interface Store {
  storeid: string;
  owner: string;
  storestatus: string;
  name: string;
  longitude: number;
  latitude: number;
  datecreated: string;
  isarchived: boolean;
} 

interface StoreComponentProps {
  scaleValue?: number;
  storeId?: string;
  onStoreSelect?: (storeId: string | null) => void;
  isSelected?: boolean;
}

const StoreComponent: React.FC<StoreComponentProps> = ({ 
  scaleValue,
  storeId = "",
  onStoreSelect,
  isSelected = false,
}) => {
  const supabase = createClient();
  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  const [isStoreSelected, setIsStoreSelected] = useState(isSelected);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Store');
  const [isOpen, setIsOpen] = useState(true);

    // Fetch stores from Supabase
    const fetchStores = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      console.log('User authenticated:', !!session);

      // Joined the tables and selected everything from both tables
      const { data: store, error } = await supabase
        .from('store')
        .select(`
          *,
          storestatus:storestatus(*)
        `) 
        .eq('storeid', id);

      const storeData = store ? store[0] : null;
      
      if (storeData) {
        setStoreName(storeData.name);
        setSelectedStoreId(storeData.storeid);
        setIsOpen(storeData.storestatus.status === true);
        console.log('Store Data:', storeData);
      } else {
        setStoreName('No Data');
        setIsOpen(false);
        console.log('No store data found');
      }

    } catch (error) {
      setError('Failed to load stores');
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle store click
  const handleStoreClick = () => {
    if (isStoreSelected) {
      setIsStoreSelected(false);
      if (onStoreSelect) onStoreSelect(null);
    } else {
      setIsStoreSelected(true);
      setSelectedStoreId(storeId);
      if (onStoreSelect) onStoreSelect(storeId);
  
      if (storeId) {
        fetchStores(storeId);
      }
    }
  };
  
  useEffect(() => {
    // Only fetch stores if we have a valid storeId and the store is selected
    if (storeId && isSelected) {
      handleStoreClick();
      fetchStores(storeId);
    }
  }, [storeId, isSelected]);

  return (
    <>
      {isStoreSelected ? (
        <div className="stores-container">
          {/* Header */}
          <div className="">
            <h1 className="text-3xl font-bold">{storeName}</h1>
            <span className="text-3xl">{isOpen ? 'Open' : 'Closed'}</span>
          </div>
          {/* Eatery Button
          <div className="bg-emerald-700 p-4 pb-6">
              <button className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold flex items-center">
                <span className="mr-2">🍴</span> Eatery
              </button>
            </div> */}
          {/* Use the ProductCard component to display dynamic store data */}
          <ProductCard 
            storeid={selectedStoreId} 
            currentPage={1} 
            itemsPerPage={5}
          />
        </div>
      ) : (
          <VisitaPlaceholder />
      )}
    </>
  );
};

export default StoreComponent;