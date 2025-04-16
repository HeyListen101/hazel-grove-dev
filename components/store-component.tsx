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
  const itemsPerPage = 5;
  
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
          
          {/* Product content area with fixed height to ensure consistent spacing */}
          <div className="h-[650px] max-h-[700px] overflow-y-auto bg-white p-4">
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