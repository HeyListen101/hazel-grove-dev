'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ui/product-card';
import { createClient } from "@/utils/supabase/client";
import VisitaPlaceholder from './visita-placeholder';

interface StoreComponentProps {
  scaleValue?: number;
  storeId?: string;
  onStoreSelect?: (storeId: string | null) => void;
  isSelected?: boolean;
  storeName?: string;
  isOpen?: boolean;
}

interface Product {
  productid: string;
  store: string;
  productstatus: any;
  contributor: string;
  brand: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
  price: number | string;
  description?: string;
}

const StoreComponent: React.FC<StoreComponentProps> = ({ 
  storeId = "",
  onStoreSelect,
  isSelected = false,
  storeName = "Store",
  isOpen = true,
}) => {
  const supabase = createClient();
  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  const [isStoreSelected, setIsStoreSelected] = useState(isSelected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  
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
  
  // Fetch all products for the store
  const fetchAllProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('product')
        .select('*, productstatus(*)')
        .eq('store', storeId)
        .order('productstatus', { ascending: true });
      
      if (error) throw error;
      
      console.log('Raw product data:', data);
      
      // Process the products data
      const processedProducts = data?.map(product => {
        // Ensure price is properly formatted
        let processedPrice = product.productstatus.price;

        return {
          ...product,
          price: processedPrice,
          productstatus: typeof product.productstatus === 'object' ? 
                        product.productstatus?.productstatusid || '' : 
                        product.productstatus || ''
        };
      }) || [];
      
      setProducts(processedProducts);
      
      // Calculate total pages
      const totalItems = processedProducts.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      
      console.log('Processed product data:', processedProducts);
      
    } catch (error) {
      console.log('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up realtime subscription
  useEffect(() => {
    if (!storeId || !isSelected) return;
    
    // Fetch initial products
    fetchAllProducts();
    
    // Set up realtime subscription
    const productChannel = supabase
      .channel(`product-changes-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (insert, update, delete)
          schema: 'public',
          table: 'product',
          filter: `store=eq.${storeId}`,
        },
        async (payload) => {
          console.log('Product realtime update received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // Fetch the new product and add it to the list
            const { data } = await supabase
              .from('product')
              .select('*, productstatus(*)')
              .eq('productid', payload.new.productid)
              .single();
              
            if (data) {
              const newProduct = {
                ...data,
                price: typeof data.price === 'string' ? data.price : 
                       typeof data.price === 'number' ? data.price : 'N/A',
                productstatus: typeof data.productstatus === 'object' ? 
                              data.productstatus?.productstatusid || '' : 
                              data.productstatus || ''
              };
              
              setProducts(prevProducts => {
                const updatedProducts = [...prevProducts, newProduct];
                // Sort by name to maintain order
                updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
                return updatedProducts;
              });
              
              // Update total pages
              setTotalPages(prev => Math.ceil((products.length + 1) / itemsPerPage));
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update the product in the list
            setProducts(prevProducts => {
              return prevProducts.map(product => {
                if (product.productid === payload.new.productid) {
                  return {
                    ...product,
                    ...payload.new,
                    price: typeof payload.new.price === 'string' ? payload.new.price : 
                           typeof payload.new.price === 'number' ? payload.new.price : 'N/A',
                  };
                }
                return product;
              });
            });
          } else if (payload.eventType === 'DELETE') {
            // Remove the product from the list
            setProducts(prevProducts => {
              const filteredProducts = prevProducts.filter(
                product => product.productid !== payload.old.productid
              );
              
              // Update total pages
              setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
              
              return filteredProducts;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Product subscription status:', status);
      });
    
    // Clean up subscription when component unmounts or store changes
    return () => {
      supabase.removeChannel(productChannel);
    };
  }, [storeId, isSelected]);
  
  useEffect(() => {
    // Only update state if we have a valid storeId and the store is selected
    if (storeId && isSelected) {
      setIsStoreSelected(true);
      setSelectedStoreId(storeId);
      setCurrentPage(1);
      // Reset error state when selecting a store
      setError(null);
      // Fetch products when store is selected
      fetchAllProducts();
    } else {
      setIsStoreSelected(false);
    }
  }, [storeId, isSelected]);

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get the current page products
    const currentProducts = products.slice(startIndex, endIndex);
    
    // Log the current products being sent to ProductCard
    console.log('Current page products:', currentProducts);
    
    return currentProducts;
  };

  return (
  <>
    {isStoreSelected ? (
      <div className="stores-container rounded-lg shadow-lg overflow-hidden">
      {/* Header with background image */}
      <div 
        className="relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: "url('/Background.png')",
          height: "180px",
        }}
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Store name with better visibility */}
        <div className="relative p-4 z-10">
          <h1 className="text-3xl font-bold text-white">{storeName}</h1>
        </div>
        
        {/* Eatery button positioned at the bottom of the header */}
        <div className="absolute bottom-0 left-0 p-4 pb-6 z-10">
          <button className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold flex items-center shadow-md transition-all duration-300 hover:shadow-lg">
            <span className="mr-2">🍴</span> Eatery
          </button>
        </div>
      </div>    
      {/* Product content area with fixed height to ensure consistent spacing */}
      <div className="h-[650px] max-h-[650px] overflow-y-auto bg-white p-4">
        {/* This div will maintain consistent height even when empty */}
        {loading ? (
          <div className="flex justify-center items-center h-full text-black">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <ProductCard 
            products={getCurrentPageProducts()} 
            totalProducts={products.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPagination={false}
          />
        )}
      </div>
      {/* Pagination controls moved to StoreComponent */}
      <div className="bg-white border-t border-gray-200">
      <div className="flex justify-between text-gray-500 py-2">
        <button 
          className={`flex items-center text-lg ${currentPage === 1 ? 'text-[#6A6148]cursor-not-allowed' : 'text-[#6A6148] hover:text-emerald-900'}`}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <span className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#6A6148" d="M16.62 2.99a1.25 1.25 0 0 0-1.77 0L6.54 11.3a.996.996 0 0 0 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76" />
          </svg>
          </span> Prev
        </button>
        <span className="text-gray-600 text-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className={`flex items-center text-lg ${currentPage === totalPages ? 'text-[#6A6148] cursor-not-allowed' : 'text-text-[#6A6148] hover:text-emerald-900'}`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next <span className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#6A6148" d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01" />
            </svg>
          </span>
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