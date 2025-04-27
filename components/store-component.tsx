'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react"
import ProductCard from './ui/product-card';
import { createClient } from "@/utils/supabase/client";
import VisitaPlaceholder from './visita-placeholder';
import BackgroundImage from '@/components/assets/background-images/Background.png';

interface StoreComponentProps {
  scaleValue?: number;
  storeId?: string;
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
  isSelected = false,
  storeName = "Store",
}) => {
  const supabase = createClient();
  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  const [isStoreSelected, setIsStoreSelected] = useState(isSelected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
   // Pagination
   const handlePrevPage = () => {
    if (currentPage > 1 && isAnimationComplete && !isAnimating) {
      setIsAnimating(true);
      setIsAnimationComplete(false);
      
      setCurrentPage(currentPage - 1);

      setTimeout(() => {
        setIsAnimationComplete(true);
        setIsAnimating(false);
      }, 1100);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && isAnimationComplete && !isAnimating) {
      setIsAnimating(true);
      setIsAnimationComplete(false);
      
      setCurrentPage(currentPage + 1);
      
      setTimeout(() => {
        setIsAnimationComplete(true);
        setIsAnimating(false);
      }, 1100);
    }
  };
  
  // Handle animation completion
  const handleAnimationComplete = () => {
    // This function is still needed for initial load
    // but we won't use it for pagination timing
    if (!isAnimating) {
      setIsAnimationComplete(true);
    }
    // We don't set a timer here anymore
  };
  
  // Fetch all products for the store
  const fetchAllProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      // Reset animation state when fetching new products
      setIsAnimationComplete(false);
      
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
          
          // Reset animation state when products change
          setIsAnimationComplete(false);
          
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
      // Reset animation state when selecting a store
      setIsAnimationComplete(false);
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
    <AnimatePresence mode="wait">
    {isStoreSelected ? (
      <motion.div
        className="stores-container rounded-lg shadow-lg overflow-hidden"
        key="store"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with background image */}
        <motion.div 
          className="relative transition-all duration-500 ease-in-out"
          style={{ height: "180px" }}
          layoutId="background-container"
        >

          {/* Background Placeholder */}
          <motion.img
            layoutId="background-image"
            src={BackgroundImage.src}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Background Placeholder */}
          <motion.img
            layoutId="background-image"
            src={BackgroundImage.src}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay for better text visibility */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />
          
          {/* Store name with better visibility */}
          <motion.div 
            className="relative p-4 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <h1 className="text-6xl font-bold text-white">{storeName}</h1>
          </motion.div>
          
          {/* Eatery button positioned at the bottom of the header */}
          <motion.div 
            className="absolute bottom-0 left-0 p-4 pb-6 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <button className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold flex items-center shadow-md transition-all duration-300 hover:shadow-lg">
              <span className="mr-2">🍴</span> Eatery
            </button>
          </motion.div>
        </motion.div>
        {/* Product content area - with fixed height and flex layout to maintain consistent spacing */}
        <div 
          className="bg-white p-4 flex flex-col" 
          style={{ height: '640px' }}
        >
        {/* Content wrapper that will grow to fill available space */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex justify-center items-center text-black py-8 h-full">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 h-full">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <ProductCard 
              products={getCurrentPageProducts()} 
              currentPage={currentPage}
              onAnimationComplete={handleAnimationComplete}
            />
          )}
          </div>
        </div>
        {/* Pagination controls with proper padding to align with content area */}
        <div className="bg-white">
          <div className="flex justify-between text-gray-500 py-4 px-4">
            <button 
              className={`flex items-center text-lg ${isAnimating || !isAnimationComplete || currentPage === 1 ? 'text-[#6A6148] opacity-50 cursor-not-allowed' : 'text-[#6A6148] hover:text-emerald-900'}`}
              onClick={handlePrevPage}
              disabled={isAnimating || !isAnimationComplete || currentPage === 1}
            >
              <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              </span> Prev
            </button>
            <span className="text-gray-600 text-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className={`flex items-center text-lg ${isAnimating || !isAnimationComplete || currentPage === totalPages ? 'text-[#6A6148] opacity-50 cursor-not-allowed' : 'text-[#6A6148] hover:text-emerald-900'}`}
              onClick={handleNextPage}
              disabled={isAnimating || !isAnimationComplete || currentPage === totalPages}
            >
              Next <span className="ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              </span>
            </button>
          </div>
        </div>
    </motion.div>
  ) : (
    <VisitaPlaceholder key="placeholder" />
    )}
    </AnimatePresence>
  );
};

export default StoreComponent;