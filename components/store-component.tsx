'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import BackgroundImage from '@/components/assets/background-images/Background.png';
import StoreStatusCard from './ui/store-status-card';
import { useMapSearch } from '@/components/map-search-context';
import { Button } from './ui/button';

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

type UpdateProdName = {
  id: string;
  name: string;
};

type UpdateProdPrice = {
  id: string;
  price: number;
};

type StoreComponentProps = {
  storeId?: string,
  isSelected?: boolean,
  storeName?: string,
}

const StoreComponent: React.FC<StoreComponentProps> = ({ 
  storeId = "",
  isSelected = false,
  storeName = "",
}) => {
  const supabase = createClient();
  const {isOpen, setIsOpen} = useMapSearch();
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setAddingProduct] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("User");
  const [productNames, setProductNames] = useState<string[]>([]);
  const [storeType, setStoreType] = useState<string | null>(null); 
  const [productPrices, setProductPrices] = useState<number[]>([]);
  const [storeDetailsLoading, setStoreDetailsLoading] = useState(false);
  const [currProdNames, setCurrProdNames] = useState<UpdateProdName[]>([]);
  const [currProdPrices, setCurrProdPrices] = useState<UpdateProdPrice[]>([]);
  
  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user.id);
      }
    };
    fetchUser();
  }, [supabase]);

  // Add this useEffect to handle screen size changes
  useEffect(() => {
    // Function to update items per page based on screen width
    const handleResize = () => {
      if (window.innerWidth < 1450) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };
    
    // Set initial value
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

    // Effect for fetching store details (including storetype) and products
  useEffect(() => {
    if (storeId && isSelected) {
      // Reset states for the new store
      setProducts([]);
      setStoreType(null);
      setCurrentPage(1);
      setTotalPages(1);
      setError(null);

      const fetchStoreData = async () => {
        setStoreDetailsLoading(true);
        try {
          const { data: storeData, error: storeError } = await supabase
            .from('store') // Assuming your table is named 'store'
            .select('store_type')
            .eq('storeid', storeId)
            .single();

          if (storeError) {
            console.error('Error fetching store type:', storeError.message);
            setStoreType('N/A'); // Or some default error value
          } else if (storeData) {
            setStoreType(storeData.store_type);
          } else {
            setStoreType('N/A'); // Store not found or storetype is null
          }
        } catch (err) {
          console.error('Exception fetching store type:', err);
          setStoreType('Error');
        }
        setStoreDetailsLoading(false);
      };
      
      fetchStoreData();
      fetchAllProducts(); // Fetch products after setting up store details
    } else {
      // Reset when no store is selected or deselected
      setProducts([]);
      setStoreType(null);
    }
  }, [storeId, isSelected, supabase]);

  // Set up realtime product subscription
  useEffect(() => {
    if (!storeId || !isSelected) return;
    // Subscribe to product changes for the current store
    const productChannel = supabase
      .channel(`product-changes-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'product',
          filter: `store=eq.${storeId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('product')
              .select('*, productstatus(*)')
              .eq('productid', payload.new.productid)
              .single();
            if (data) {
              const newProduct = {
                ...data,
                price: data.productstatus?.price ?? 'N/A',
                productstatus: data.productstatus?.productstatusid || ''
              };
              setProducts(prevProducts => {
                const updatedProducts = [...prevProducts, newProduct].sort((a, b) => a.name.localeCompare(b.name));
                setTotalPages(Math.ceil(updatedProducts.length / itemsPerPage));
                return updatedProducts;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('product')
              .select('*, productstatus(*)')
              .eq('productid', payload.new.productid)
              .single();
            setProducts(prevProducts => 
              prevProducts.map(product => 
                product.productid === payload.new.productid && data?.productstatus ? {
                  ...product,
                  ...payload.new,
                  price: data.productstatus.price ?? 'N/A',
                } : product
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE', // Specifically listen for DELETE
          schema: 'public',
          table: 'product',
          // No filter here for DELETE as Supabase might not support filter on OLD record for DELETE
        },
        async (payload) => {
          // Check if the deleted product belongs to the current store
          // This check is important because DELETE events might not be filterable by `storeId` in the subscription
          if (payload.old && payload.old.store === storeId) {
              setProducts(prevProducts => {
                  const filteredProducts = prevProducts.filter(
                  product => product.productid !== payload.old.productid
                  );
                  setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
                  return filteredProducts;
              });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to product changes for store ${storeId}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Product subscription error for store ${storeId}: ${status}`);
        }
      });
    
    return () => {
      supabase.removeChannel(productChannel);
    };
  }, [storeId, isSelected, supabase]);

   // Pagination
  const handlePrevPage = () => {
    if (currentPage > 1 && !isAnimating) {
      setIsAnimating(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isAnimating) {
      setIsAnimating(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };
  
  // Fetch all products for the store
  const fetchAllProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase 
        .from('product')
        .select('*, productstatus!inner(productstatusid, price, isavailable, contributor)') // Use !inner to ensure productstatus exists
        .eq('store', storeId)
        .order('name', { ascending: true }); // Order by name for consistency
      
      if (error) throw error;
      
      const processedProducts = data?.map(product => ({
        ...product,
        price: product.productstatus?.price ?? 'N/A', // Ensure price exists
        // productstatus id is already part of the productstatus object
      })) || [];
      
      setProducts(processedProducts);
      setTotalPages(Math.ceil(processedProducts.length / itemsPerPage));
      
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  };

  // Toggle store status upon button click
  const toggleStoreStatus = async () => {
    if (!storeId) return;
    const newStatus = !isOpen;
    const { data: statusData, error: insertErr } = await supabase
      .from('storestatus')
      .insert({ contributor: currentUser, status: newStatus })
      .select('storestatusid')
      .single();
    
    if (insertErr || !statusData) {
      console.error("Error creating new store status:", insertErr);
      return;
    }
        
    const { error: updateErr } = await supabase
      .from('store')
      .update({ storestatus: statusData.storestatusid })
      .eq('storeid', storeId);
    
    if (!updateErr) {
      setIsOpen(newStatus);
    } else {
      console.error("Error updating store status:", updateErr);
    }
  };

  const toggleEdit = () => { // Simplified
    setEditing(!isEditing);
    if (isEditing) { // If was editing, now canceling
        setAddingProduct(false);
        setProductNames([]);
        setProductPrices([]);
        setCurrProdNames([]);
        setCurrProdPrices([]);
    }
  };

  const saveEdit = async () => { // Made async
    // setIsAnimating(true); // Optional: for loading state during save
    try {
        // Save new products
        for (let i = 0; i < productNames.length; i++) {
            const name = productNames[i];
            const price = productPrices[i];
            if (name && price !== undefined) { // Ensure price is defined, 0 is a valid price
                const { data: statusData, error: statusError } = await supabase
                    .from('productstatus')
                    .insert({ contributor: currentUser, price: price, isavailable: true })
                    .select('productstatusid')
                    .single();

                if (statusError || !statusData) throw statusError || new Error("Failed to create product status");

                await supabase.from('product').insert({
                    store: storeId, // Use storeId from props
                    productstatus: statusData.productstatusid,
                    contributor: currentUser,
                    brand: storeName,
                    name: name,
                });
            }
        }

        // Update existing product names
        for (const nameUpdate of currProdNames) {
            if (nameUpdate) { // Check if the entry exists (sparse array)
                await supabase.from('product').update({ name: nameUpdate.name }).eq('productid', nameUpdate.id);
            }
        }

        // Update existing product prices
        for (const priceUpdate of currProdPrices) {
           if (priceUpdate) { // Check if the entry exists
             await supabase.from('productstatus').update({ price: priceUpdate.price }).eq('productstatusid', priceUpdate.id);
             // To trigger realtime update on product (since productstatus might not be subscribed directly with filter)
             await supabase.from('product').update({ productstatus: priceUpdate.id }).eq('productstatus', priceUpdate.id);
           }
        }
        
        // Reset editing states
        setEditing(false);
        setAddingProduct(false);
        setProductNames([]);
        setProductPrices([]);
        setCurrProdNames([]);
        setCurrProdPrices([]);
        // Optionally re-fetch products to ensure UI consistency, though realtime should handle it
        // fetchAllProducts(); 
    } catch (error: any) {
        console.error("Error saving edits:", error.message);
        setError("Failed to save changes.");
    } finally {
        // setIsAnimating(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setAddingProduct(false);
    setProductNames([]);
    setProductPrices([]);
    setCurrProdNames([]);
    setCurrProdPrices([]);
  };

  const addProduct = () => {
    setAddingProduct(true); // Keep this if you have specific UI for "adding mode"
    setProductNames(prev => [...prev, '']);
    setProductPrices(prev => [...prev, 0]); // Default price to 0 or undefined
  };

  const handleNameChange = (index: number, value: string) => {
    setProductNames(prev => prev.map((name, i) => i === index ? value : name));
  };

  const handlePriceChange = (index: number, value: number) => {
    setProductPrices(prev => prev.map((price, i) => i === index ? value : price));
  };

  const handleChangeCurrentName = (index: number, productid: string, value: string) => {
    setCurrProdNames(prev => {
        const newArr = [...prev];
        newArr[index] = {id: productid, name: value};
        return newArr;
    });
  };

  const handleChangeCurrentPrice = (index: number, productstatusid: string, value: number) => {
    setCurrProdPrices(prev => {
        const newArr = [...prev];
        newArr[index] = {id: productstatusid, price: value};
        return newArr;
    });
  };

  const deleteProduct = async (productid: string, productstatusid: string, _: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    // Order matters: delete dependent product first, then productstatus, or handle DB constraints (ON DELETE CASCADE)
    try {
        const { error: productDeleteError } = await supabase
            .from('product')
            .delete()
            .eq('productid', productid);
        if (productDeleteError) throw productDeleteError;

        const { error: statusDeleteError } = await supabase
            .from('productstatus')
            .delete()
            .eq('productstatusid', productstatusid);
        if (statusDeleteError) throw statusDeleteError;
        
        // Realtime should update the list, but you could also manually filter here
        // for immediate UI feedback if needed, though it's better to rely on the subscription.
    } catch (error: any) {
        console.error("Error deleting product:", error.message);
        setError("Failed to delete product.");
    }
  };
  
  const getStoreEmoji = (type: string | null): string => {
    if (!type) return "🏪"; // Default store emoji if type is null or undefined
  
    const lowerType = type.toLowerCase(); // Ensure case-insensitivity
  
    switch (lowerType) {
      case 'eatery':
        return "🍴"; // Fork and knife
      case 'pie':
        return "🥧"; // Pie
      case 'restroom':
        return "🚻"; // Restroom symbol
      case 'clothing':
        return "👕"; // T-shirt (or 🛍️ for shopping bag)
      case 'pizza':
        return "🍕"; // Pizza slice
      case 'cookie':
        return "🍪"; // Cookie
      case 'notebook':
        return "📓"; // Notebook (or 📝 for pencil/memo)
      case 'printer':
        return "🖨️"; // Printer
      case 'basket':
        return "🧺"; // Basket (or 🛒 for shopping cart)
      case 'veggie':
        return "🥕"; // Carrot (or 🥦 for broccoli, 🥬 for leafy green)
      case 'meat':
        return "🥩"; // Cut of meat
      case 'personnel':
        return "👥"; // Busts in silhouette (or 🧑‍💼 for office worker)
      case 'park':
        return "🌳"; // Deciduous tree (or 🏞️ for national park)
      case 'water':
        return "💧"; // Droplet (or 🥤 for cup with straw if it's drinking water)
      case 'haircut':
        return "✂️"; // Scissors (or 💈 for barber pole)
      case 'mail':
        return "✉️"; // Envelope (or 📮 for postbox)
      case 'money':
        return "💰"; // Money bag (or 💵 for dollar banknote)
      case 'coffee':
        return "☕"; // Hot beverage
      case 'milk':
        return "🥛"; // Glass of milk (or 🍼 for baby bottle if appropriate)
      default:
        return "🏪"; // Fallback for any types not explicitly listed
    }
  };

  return (
    // AnimatePresence key should ideally be storeId to re-trigger animations when store changes
    <AnimatePresence mode="wait" key={storeId}> 
      {isSelected && storeId && (
        <motion.div
          className="bg-white grid grid-rows-[100px_1fr] md:grid-rows-[120px_1fr] h-full rounded-[15px] shadow-md flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with background image */}
          <motion.div 
            className="w-full relative transition-all duration-500 ease-in-out" // Ensure minimum height for header
            layoutId={`background-container-${storeId}`} // Make layoutId unique if multiple StoreComponents could be on screen
          >
            
            <motion.img
              layoutId={`background-image-${storeId}`}
              src={BackgroundImage.src}
              alt="Background"
              className="absolute z-0 w-full h-full object-cover rounded-t-[15px] md:rounded-[15px]" // z-0 to be behind overlay
            />
            
            <motion.div 
              className="absolute z-1 bg-black bg-opacity-30 w-full h-full rounded-t-[15px] md:rounded-[15px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            />
            {/* Status Card  */}
            <motion.div 
              className="pointer-events-auto absolute right-1 top-2 md:top-2 md:-right-[75] z-10" // Adjusted positioning
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 0.4 }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button className="bg-transparent hover:bg-transparent focus:bg-transparent h-[96px] px-0 pb-[55px] rounded-[24]" onClick={toggleStoreStatus}>  
                <StoreStatusCard isOpen={isOpen || false} />
              </Button>
            </motion.div>
            {/* Store Name */}
            <motion.div 
              className="relative pt-1 pl-2 md:pt-2 md:pl-3 z-2" // z-2 to be above overlay
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white line-clamp-2 pr-12">{storeName}</h1>
            </motion.div>          
            {/* Store Type Label */}
            <motion.div
              className="absolute bottom-0 left-0 p-3 z-2" // z-2 to be above overlay
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >   
               <button className="bg-white text-emerald-700 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs rounded-full font-bold flex items-center shadow-md transition-all duration-300 hover:shadow-lg">
                <span className="mr-1 text-[10px] md:text-xs">{getStoreEmoji(storeType)}</span> 
                <span className="whitespace-nowrap"> {/* Prevent wrapping for store type name */}
                  {storeDetailsLoading ? "Loading..." : (storeType ? storeType.charAt(0).toUpperCase() + storeType.slice(1) : "Type")}
                </span>
              </button>
            </motion.div>  
          </motion.div>
          {/* Products section */}
          <div className="w-full overflow-hidden flex flex-col justify-between rounded-b-[15px] md:rounded-[15px] ">
            <div className="mb-1 md:mb-2 text-left gap-x-2 md:gap-x-4 sticky bg-white z-10 mx-4 pt-2">
              <h2 className="text-l md:text-md font-semibold text-gray-800 text-left">Products/Services</h2>
            </div>
            <div
              className="overflow-y-auto flex-grow px-4
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <p>Loading products...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : products.length === 0 && !isEditing ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <p>No products found for this store.</p>
                </div>
              ) : (
                <>
                  {/* Table header - only show if not editing or if editing and has products */}
                  {(getCurrentPageProducts().length > 0 || isAddingProduct || isEditing && products.length === 0 ) && (
                    <div className="flex mb-1 md:mb-2 text-left gap-x-2 md:gap-x-4 sticky top-0 bg-white z-10 py-2 border-b border-gray-200">
                      <div className="font-medium text-gray-600 flex-grow text-xs md:text-sm basis-1/3 md:basis-1/2 md:w-16 md:text-left">Name</div>
                      <div className="font-medium text-gray-600 flex-grow text-xs md:text-sm basis-1/3 md:basis-2/4 md:w-16 md:text-right">Price</div>
                      {isEditing && <div className="w-[15px] flex-shrink-0"></div>} {/* Spacer for delete icon */}
                    </div>
                  )}
                  {/* Product list */}
                  <AnimatePresence>
                  <motion.div
                    key={currentPage} // Add key here for page transition animation
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    {getCurrentPageProducts().map((product, index) => (
                      <motion.div 
                        key={product.productid}
                        layout // Animate layout changes (e.g., when deleting)
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center pb-1 border-b border-gray-100 gap-x-2 md:gap-[10px]"
                      >
                        {isEditing ? (
                          <>
                            <input 
                              type="text" 
                              defaultValue={product.name}
                              className="bg-white text-black text-left text-sm flex-grow p-1 border rounded-[10px] min-w-0" // min-w-0 for flex basis
                              onChange={(e) => handleChangeCurrentName(index, product.productid, e.target.value)}
                              required
                            />
                            <input 
                              type="number"
                              defaultValue={product.price as number} // Assuming price is number when editing
                              className="bg-white text-black text-right text-sm w-16 md:w-[20%] p-1 border rounded-[10px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              onChange={(e) => handleChangeCurrentPrice(index, product.productstatus.productstatusid, Number(e.target.value))}
                              required
                              step="0.01" // For currency
                            />
                            <button 
                              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => deleteProduct(product.productid, product.productstatus.productstatusid, e as any)}
                              className="flex-shrink-0 p-1 bg-[#F07474] hover:bg-red-600 rounded-full transition-colors"
                              aria-label="Delete product"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[10px] h-[10px]" fill="white">
                                <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-gray-800 text-sm flex-grow basis-2/3 md:basis-1/2 truncate" title={product.name}>{product.name}</div>
                            <div className="text-gray-800 font-medium text-sm basis-1/3 md:basis-auto w-16 md:w-fit text-right">₱{product.price}</div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                  </AnimatePresence>
                  {/* Add product button */}
                  {isEditing && productNames.map((_, index) => (
                    <motion.div 
                        key={`new-${index}`} 
                        className="flex items-center pb-1 border-b border-gray-100 gap-x-2 md:gap-[10px] mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                      <input
                        type="text"
                        placeholder="New Product Name"
                        value={productNames[index]}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="h-[30px] bg-white border text-black text-sm flex-grow p-1 rounded-[10px] min-w-0"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={productPrices[index]}
                        onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                        className="h-[30px] bg-white border text-black text-sm w-16 md:w-[20%] p-1 rounded-[10px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                        step="0.01"
                      />
                       <div className="w-[25px] flex-shrink-0"></div> {/* Spacer to align with delete button */}
                    </motion.div>
                  ))}
                  
                  {isEditing && ( // Moved Add Product button to be more accessible
                    <button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg mt-2 mb-1 transition-colors"
                      onClick={addProduct}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[10px] h-[10px]" fill="white">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                      </svg>
                      Add Product
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pagination controls */}
            <div className="border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center text-gray-500 py-2 md:py-3 px-1 md:px-2">
                {/* Prev Button */}
                <button 
                  className={`text-xs md:text-sm flex items-center ${currentPage === 1 || products.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || products.length === 0}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Prev
                </button>

                {/* Edit / Save / Cancel Buttons */}
                {isEditing ? (
                  <div className="flex gap-1 md:gap-2 basis-1/2">
                    <Button variant="default" onClick={saveEdit}className="bg-emerald-600 hover:bg-emerald-700 md:text-xs w-50 h-8 basis-1/2 flex items-center">
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} className="bg-red-300 md:text-xs w-50 h-8 text-gray-700 basis-1/2 flex items-center">  
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button className="bg-transparent md:text-xs w-50 h-8 text-gray-700 flex items-center" onClick={toggleEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                    Edit Products
                  </Button>
                )}
              {/* Next Button */}
                <button 
                   className={`text-xs md:text-sm flex items-center ${(currentPage === totalPages || totalPages <= 1 || products.length === 0) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages <= 1 || products.length === 0}
                >
                  Next
                    <svg className="w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoreComponent;