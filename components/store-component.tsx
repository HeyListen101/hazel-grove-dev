'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react"
import { createClient } from "@/utils/supabase/client";
import BackgroundImage from '@/components/assets/background-images/Background.png';
import StoreStatusCard from './ui/store-status-card';
import { useMapSearch } from '@/components/map-search-context';
import { getSupabaseAuth } from '@/utils/supabase/auth-singleton';

type StoreComponentProps = {
  storeId?: string,
  isSelected?: boolean,
  storeName?: string,
  width?: number,
  height?: number,
}

type Product = {
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
  storeName = "",
}) => {
  const supabase = createClient();
  const supabaseAuth = getSupabaseAuth();
  const [currentUser, setCurrentUser] = useState<string>("User");
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
  const {
      setStoreName, 
      isOpen, 
      setIsOpen,
      selectedProductName
    } = useMapSearch();
  
  useEffect(() => {
    // Get the current user when component mounts
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        // Use email or id as the user identifier
        setCurrentUser(data.user.id);
      }
    };
    fetchUser();
  }, []);

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
    if (!isAnimating) {
      setIsAnimationComplete(true);
    }
  };
  
  // Fetch all products for the store
  const fetchAllProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
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

  // Toggle store status upon button click
  const toggleStoreStatus = async () => {
    // Create new status by the current logged in user as the contributer
    const { data: statusData, error: insertErr } = await supabase
    .from('storestatus')
    .insert({ contributor: currentUser, status: !isOpen })
    .select();
    
    // Check if insertion was successfull
    const statusId = statusData? statusData[0] : null;
    
    // Update store db with the new store status
    if (statusId) {
      const { error } = await supabase
      .from('store')
      .update({ storestatus: statusId.storestatusid })
      .eq('storeid', storeId);
    }
    
    // Set current isOpen variable its new value upon toggle
    if (!insertErr) {
      setIsOpen(!isOpen);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <div className="bg-white grid grid-rows-[1fr_230px] h-full rounded-[15px] shadow-md">
        {/* Header with background image */}
        <motion.div 
          className="w-full relative transition-all duration-500 ease-in-out"
          layoutId="background-container"
        >
          
          {/* Background Image */}
          <motion.img
            layoutId="background-image"
            src={BackgroundImage.src}
            alt="Background"
            className="absolute z-1 w-full h-full object-cover rounded-[15px]"
          />
          
          {/* Overlay for better text visibility */}
          <motion.div 
            className="absolute z-2 bg-black bg-opacity-30 w-full h-full rounded-[15px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />

          {/* Status Card */}
          <motion.div 
            className="pointer-events-auto absolute -top-[45px] -right-[55px] z-3"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 0.4 }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ 
              delay: 0.5,
              duration: 0.3
            }}
          >
            <StoreStatusCard isOpen={isOpen || false} />
          </motion.div>
          
          {/* Store name with better visibility */}
          <motion.div 
            className="relative pt-2 pl-3 z-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <h1 className="text-sm font-bold text-white">{storeName}</h1>
          </motion.div>
          
          {/* Open button - positioned at the top right */}
          <motion.div
            className="absolute bottom-0 right-0 p-3 z-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
          {isOpen ? (
            <button 
              className="bg-[#F07474] text-white px-3 py-1 text-xs rounded-md font-bold shadow-md transition-all duration-300 hover:shadow-lg"
              onClick={toggleStoreStatus}
            >
              Close
            </button>
          ) : (
            <button 
              className="bg-green-600 text-white px-3 py-1 text-xs rounded-md font-bold shadow-md transition-all duration-300 hover:shadow-lg"
              onClick={toggleStoreStatus}
            >
              Open
            </button>
          )}
            
          </motion.div>
          
          {/* Eatery button positioned at the bottom of the header */}
          <motion.div 
            className="absolute bottom-0 left-0 p-3 z-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <button className="bg-white text-emerald-700 px-3 py-1 text-xs rounded-full font-bold flex items-center shadow-md transition-all duration-300 hover:shadow-lg">
              <span className="mr-1">🍴</span> Eatery
            </button>
          </motion.div>  
        </motion.div>

        {/* Products section */}
        <div className="w-full overflow-hidden flex flex-col">
          {/* Products header */}
          <div className="py-2 border-b border-gray-200 w-[85%] self-center">
            <h2 className="text-md font-semibold text-gray-800 text-left">Products</h2>
          </div>

          {/* Products table */}
          <div 
            className="overflow-y-auto 
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-[#F0F0F0]
              dark:[&::-webkit-scrollbar-thumb]:bg-neutral-400
              "
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="px-4 py-2">
                {/* Table header */}
                <div className="flex justify-between mb-2 text-left">
                  <div className="font-medium text-gray-700 w-1/2 text-sm">Name</div>
                  <div className="font-medium text-gray-700 w-1/2 text-right text-sm">Price</div>
                </div>
                
                {/* Product list * */}
                <div className="space-y-2">
                  {getCurrentPageProducts().map((product) => (
                    <div 
                      key={product.productid}
                      className="flex justify-between items-center pb-1 border-b border-gray-100"
                    >
                      <div className="text-left text-gray-800 text-sm">{product.name}</div>
                      <div className="text-right text-gray-800 font-medium text-sm">₱{product.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination controls * */}
          <div className="border-t border-gray-200">
            <div className="flex justify-between text-gray-500 py-3 px-2">
              <button 
                className={`text-sm flex items-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </span> 
                Prev
              </button>
              
              {/* Edit Products button * */}
              <button className="text-gray-700 flex items-center text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                Edit Products
              </button>
              
              <button 
                className={`text-sm flex items-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*
      <motion.div
        className="w-full h-full bg-black rounded-[15px] flex flex-col justify-between overflow-hidden"
        key="store"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        
      </motion.div>
      */}
    </AnimatePresence>
  );
};

export default StoreComponent;