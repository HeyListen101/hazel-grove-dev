'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ui/product-card';
import { createClient } from "@/utils/supabase/client";

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
  // State to track which store is currently selected
  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  const [isStoreSelected, setIsStoreSelected] = useState(isSelected);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Store');
  const [isOpen, setIsOpen] = useState(true);

  // Fetch stores from Supabase
   // Fetch stores from Supabase
   const fetchStores = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
  
      const { data: { session } } = await supabase.auth.getSession();
      console.log('User authenticated:', !!session);
  
      const { data: store, error } = await supabase
        .from('store')
        .select('*')
        .eq('storeid', id); // <-- use the id passed in
  
      const storeData = store ? store[0] : null;
      
      if (storeData) {
        setStoreName(storeData.name);
        setSelectedStoreId(storeData.storeid);
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
        fetchStores(storeId); // <-- pass it directly
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
    <div 
      className={`stores-container ${isStoreSelected ? 'selected-store' : 'bg-[#000000]'}`}
    >
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

      {/* Use the ProductCard component to display dynamic store data
      <ProductCard 
        storeid={isStoreSelected ? selectedStoreId : ""} 
        currentPage={1} 
        itemsPerPage={5}
      /> */}
    </div>
  );
};

export default StoreComponent;