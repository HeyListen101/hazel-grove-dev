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
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

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
        
        // Get total count of products for pagination
        const { count } = await supabase
          .from('product')
          .select('*', { count: 'exact', head: true })
          .eq('store', id);
          
        if (count !== null) {
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
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
  
  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Update total pages when product data changes
  const handleTotalPagesUpdate = (pages: number) => {
    setTotalPages(pages);
  };
  
  useEffect(() => {
    // Only fetch stores if we have a valid storeId and the store is selected
    if (storeId && isSelected) {
      handleStoreClick();
      fetchStores(storeId);
      // Reset to first page when selecting a new store
      setCurrentPage(1);
    }
  }, [storeId, isSelected]);

  return (
    <>
      {isStoreSelected ? (
        <div className="stores-container rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4">
            <h1 className="text-3xl font-bold">{storeName}</h1>
            <span className="text-3xl">{isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <div className="bg-emerald-700 p-4 pb-6">
            <button className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold flex items-center">
              <span className="mr-2">🍴</span> Eatery
            </button>
          </div>
          
          {/* Use the ProductCard component to display dynamic store data */}
          <ProductCard 
            storeid={selectedStoreId} 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onTotalPagesChange={handleTotalPagesUpdate}
            showPagination={false} // Hide pagination in ProductCard
          />
          
          {/* Pagination controls moved to StoreComponent */}
          <div className="bg-white p-4 border-t border-gray-200">
            <div className="flex justify-between text-gray-500">
              <button 
                className={`flex items-center ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-700 hover:text-emerald-900'}`}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <span className="mr-2">◄</span> Prev
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className={`flex items-center ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-700 hover:text-emerald-900'}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <span className="ml-2">►</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <VisitaPlaceholder />
      )}
    </>
  );
};

export default StoreComponent;