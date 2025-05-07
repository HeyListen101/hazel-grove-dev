'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react"
import { createClient } from "@/utils/supabase/client";
import BackgroundImage from '@/components/assets/background-images/Background.png';
import StoreStatusCard from './ui/store-status-card';
import { useMapSearch } from '@/components/map-search-context';

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
  const [isEditing, setEditing] = useState(false);
  const [isAddingProduct, setAddingProduct] = useState(false);
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
                price: typeof data.productstatus.price === 'string' ? data.productstatus.price : 
                       typeof data.productstatus.price === 'number' ? data.productstatus.price : 'N/A',
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
            const { data } = await supabase
            .from('product')
            .select('*, productstatus(*)')
            .eq('productid', payload.new.productid)
            .single();

            setProducts(prevProducts => {
              return prevProducts.map(product => {
                if (product.productid === payload.new.productid && data?.productstatus) {
                  // Fetch the new product and add it to the list
                  return {
                    ...product,
                    ...payload.new,
                    price: typeof data.productstatus.price === 'string' ? data.productstatus.price : 
                           typeof data.productstatus.price === 'number' ? data.productstatus.price : 'N/A',
                  };
                }
                return product;
              });
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (insert, update, delete)
          schema: 'public',
          table: 'product',
        },
        async (payload) => {
          // Reset animation state when products change
          setIsAnimationComplete(false);
          
          // Delete events are not filterable so this is seperated from the first 'on' change before this, without adding any filters
          if (payload.eventType === 'DELETE') {
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
  };

  const toggleEdit = async () => {
    setEditing(true);
  };

  const saveEdit = () => {
    setEditing(false);
    setAddingProduct(false);

    productNames.map(async (name, index) => {
      if (productNames[index] && productPrices[index]) {
        const { data, error } = await supabase
        .from('productstatus')
        .insert({ contributor: currentUser, price: productPrices[index], isavailable: true, })
        .select();

        const statusData = data ? data[0] : null;

        if (statusData) {
          const { error } = await supabase
          .from('product')
          .insert({ 
            store: selectedStoreId, 
            productstatus: statusData.productstatusid, 
            contributor: currentUser,
            brand: storeName,
            name: name, 
          });
        }
      }
    });

    currProdNames.map(async (data, index) => {
      const newName = data.name;
      const prodId = data.id;

      if (currProdNames[index]) {
        const { error } = await supabase
        .from('product')
        .update({ name: newName })
        .eq('productid', prodId);
      }
    });

    currProdPrices.map(async (data, index) => {
      const newPrice = data.price;
      const prodStatusId = data.id;

      if (currProdPrices[index]) {
        const { error: err1 } = await supabase
        .from('productstatus')
        .update({ price: newPrice })
        .eq('productstatusid', prodStatusId);

        // Used only to reanimate the changing price since only the product table has realtime subscription and not the productstatus
        const { error: err2 } = await supabase
        .from('product')
        .update({ productstatus: prodStatusId })
        .eq('productstatus', prodStatusId);
      }
    });

    setProductNames([]);
    setProductPrices([]);
    setCurrProdNames([]);
    setCurrProdPrices([]);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAddingProduct(false);
    setProductNames([]);
    setProductPrices([]);
    setCurrProdNames([]);
    setCurrProdPrices([]);
  };

  const [productNames, setProductNames] = useState<string[]>([]);
  const [productPrices, setProductPrices] = useState<number[]>([]);
  const addProduct = () => {
    setAddingProduct(true);
    setProductNames([...productNames, '']);
    setProductPrices([...productPrices, 0]);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNameArr = [...productNames];
    newNameArr[index] = value;
    setProductNames(newNameArr);
  };

  const handlePriceChange = (index: number, value: number) => {
    const newPriceArr = [...productPrices];
    newPriceArr[index] = value;
    setProductPrices(newPriceArr);
  };

  type UpdateProdName = {
    id: string;
    name: string;
  };

  type UpdateProdPrice = {
    id: string;
    price: number;
  };

  const [currProdNames, setCurrProdNames] = useState<UpdateProdName[]>([]);
  const [currProdPrices, setCurrProdPrices] = useState<UpdateProdPrice[]>([]);
  const handleChangeCurrentName = (index: number, productid: string, value: string) => {
    const newNameArr = [...currProdNames];
    newNameArr[index] = {id: productid, name: value};
    setCurrProdNames(newNameArr);
  };

  const handleChangeCurrentPrice = (index: number, productstatusid: string, value: number) => {
    const newPriceArr = [...currProdPrices];
    newPriceArr[index] = {id: productstatusid, price: value};
    setCurrProdPrices(newPriceArr);
  };

  const deleteProduct = async (id: string, statusid: string, _: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const res1 = await supabase
    .from('productstatus')
    .delete()
    .eq('productstatusid', statusid);

    const res2 = await supabase
    .from('product')
    .delete()
    .eq('productid', id);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="bg-white grid grid-rows-[1fr_230px] h-full rounded-[15px] shadow-md"
        key="store"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
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
        <div className="w-full overflow-hidden flex flex-col justify-between">
          {/* Products header */}
          <div className="py-2 border-b border-gray-200 w-[85%] self-center">
            <h2 className="text-md font-semibold text-gray-800 text-left">Products</h2>
          </div>

          {/* Products table */}
          <div 
            className="overflow-y-auto flex-grow
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
              <div className="px-4 py-2" >
                {/* Table header */}
                <div className="flex mb-2 text-left gap-[50px]">
                  <div className="font-medium text-gray-700 w-1/2 text-sm">Name</div>
                  <div className="font-medium text-gray-700 text-sm w-fit">Price</div>
                </div>
                
                {/* Product list * */}
                {!isEditing ? (
                  <div className="space-y-2">
                    {getCurrentPageProducts().map((product) => (
                      <div 
                        key={product.productid}
                        className="flex items-center pb-1 border-b border-gray-100 gap-[50px]"
                      >
                        <div className="text-gray-800 text-sm w-1/2">{product.name}</div>
                        <div className="text-gray-800 font-medium text-sm">₱{product.price}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCurrentPageProducts().map((product, index) => (
                      <div 
                        key={product.productid}
                        className="flex items-center pb-1 border-b border-gray-100 gap-[10px]"
                      >
                        <input 
                          type="text" 
                          defaultValue={product.name}
                          className="bg-white text-black text-left text-sm w-1/2 flex-grow p-1 border rounded-[10px]"
                          onChange={(e) => handleChangeCurrentName(index, product.productid, e.target.value)}
                          required
                        />
                        <input 
                          type="number"
                          defaultValue={product.price}
                          className="
                            bg-white text-black text-right text-sm w-[20%] p-1 border rounded-[10px]
                            appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          "
                          onChange={(e) => handleChangeCurrentPrice(index, product.productstatus, Number(e.target.value))}
                          required
                        />
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 448 512" 
                          className="cursor-pointer w-[15px] bg-[#F07474] rounded-2xl p-1" 
                          fill="white"
                          onClick={(e) => deleteProduct(product.productid, product.productstatus, e)}
                        >
                          <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}

                {isAddingProduct && 
                <div className="justify-self-center border grid grid-cols-1 justify-center w-full">
                  {productNames.map((value, index) => (
                    <div key={index} className="flex justify-between">
                      <input
                        type="text"
                        defaultValue=""
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="h-[20px] bg-white border text-black text-xs w-[80%]"
                      />
                      <input
                        type="number"
                        defaultValue=""
                        onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                        className="h-[20px] bg-white border text-black text-xs w-[20%]"
                      />
                    </div>
                  ))}
                </div>
                }

                {isEditing &&
                <button 
                  className="bg-black/50 text-white text-xs flex justify-center gap-2 w-fit py-1 px-2 justify-self-center rounded-2xl m-5"
                  onClick={addProduct}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[12px]" fill="white">
                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                  </svg>
                  Add Product
                </button>
                }
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
              {isEditing ? (
              <>
                <button className="text-white bg-gray-700 text-[10px] px-2 rounded-sm" onClick={saveEdit}>
                  Save
                </button>
                <button className="text-gray-700 text-[10px] border px-2 rounded-sm" onClick={cancelEdit}>  
                  Cancel
                </button>
              </>
              ) : (
              <button className="text-gray-700 flex items-center text-xs" onClick={toggleEdit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                Edit Products
              </button>
              )}
            
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
      </motion.div>
    </AnimatePresence>
  );
};

export default StoreComponent;