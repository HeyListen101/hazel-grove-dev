'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import BackgroundImage from '@/components/assets/background-images/Background.png';
import StoreStatusCard from './store-status-card';
import { useMapSearch } from '@/components/map-search-context';
import { Button } from './button';
import { useEditCooldown } from '../cooldown-context';

type ProductStatusInfo = {
  productstatusid: string;
  price: number;
  isavailable: boolean;
  contributor: string;
};

type Product = {
  productid: string;
  store: string;
  productstatus: ProductStatusInfo | string;
  contributor: string;
  brand: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
  price: number | string;
  description?: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _original?: Product;
};

type StoreComponentProps = {
  storeId?: string,
  isSelected?: boolean,
  storeName?: string,
}

const pageVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%", // Start closer for bounce
    opacity: 0,
  }),
  enter: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30, restDelta: 0.001 }, // Tighter spring
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "50%" : "-50%", // Exit closer for bounce
    opacity: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, restDelta: 0.001 },
  }),
};

const StoreCard: React.FC<StoreComponentProps> = ({ 
    storeId = "",
    isSelected = false,
    storeName = "",
  }) => {
    const supabase = createClient();
    const { isEditCooldownActive, globalCooldownError, triggerGlobalEditCooldown } = useEditCooldown();
    const {isOpen, setIsOpen} = useMapSearch();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [error, setError] = useState<string | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]); 
    const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  
    const [currentUser, setCurrentUser] = useState<string>("User");
    const [storeType, setStoreType] = useState<string | null>(null); 
    const [storeDetailsLoading, setStoreDetailsLoading] = useState(false);
    const [paginationDirection, setPaginationDirection] = useState(0);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user.id);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const handleResize = () => {
      let newItemsPerPage = 9;
      if (window.innerWidth <= 881) newItemsPerPage = 2;
      else if (window.innerWidth <= 991) newItemsPerPage = 3;
      else if (window.innerWidth <= 1083) newItemsPerPage = 4;
      else if (window.innerWidth <= 1175) newItemsPerPage = 5;
      else if (window.innerWidth <= 1265) newItemsPerPage = 6;
      else if (window.innerWidth <= 1450) newItemsPerPage = 7; // Adjusted for smoother steps
      setItemsPerPage(newItemsPerPage);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (storeId && isSelected) {
      setProducts([]);
      setDraftProducts([]);
      setStoreType(null);
      setCurrentPage(1);
      setError(null);
      setEditing(false); // Exit edit mode when store changes

      const fetchStoreDetailsAndProducts = async () => {
        setStoreDetailsLoading(true);
        setLoading(true);
        try {
          const { data: storeData, error: storeError } = await supabase
            .from('store').select('store_type').eq('storeid', storeId).single();
          if (storeError) console.log('Error fetching store type:', storeError.message);
          setStoreType(storeData?.store_type || 'N/A');

          const { data: productsData, error: productsError } = await supabase 
            .from('product')
            .select('*, productstatus:productstatus(*)')
            .eq('store', storeId)
            .order('name', { ascending: true });
          if (productsError) throw productsError;
          
          const processed = (productsData || []).map(p => ({
            ...p,
            price: (p.productstatus as ProductStatusInfo)?.price ?? 'N/A',
            productstatus: p.productstatus, // Keep the object or ID
          })) as Product[];
          setProducts(processed);

        } catch (err: any) {
          console.log('Error fetching initial data:', err);
          setError('Failed to load store data.');
          setStoreType('Error');
        } finally {
          setStoreDetailsLoading(false);
          setLoading(false);
        }
      };
      fetchStoreDetailsAndProducts();
    } else {
      setProducts([]);
      setDraftProducts([]);
      setStoreType(null);
      setEditing(false);
    }
  }, [storeId, isSelected, supabase]);

  // Update total pages whenever products or itemsPerPage changes
  useEffect(() => {
    const sourceArray = isEditing ? draftProducts : products;
    setTotalPages(Math.ceil(sourceArray.length / itemsPerPage));
  }, [products, draftProducts, itemsPerPage, isEditing]);


  // Realtime product subscription (Only updates `products`, not `draftProducts` directly)
  useEffect(() => {
    if (!storeId || !isSelected || isEditing) return; // Don't interfere with draft edits

    const productChannel = supabase
      .channel(`product-changes-rt-${storeId}`)
      .on<Product>( // Type the payload
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product', filter: `store=eq.${storeId}` },
        async (payload) => {
          // If not editing, update the main products list
          if (!isEditing) {
            const { data } = await supabase.from('product')
              .select('*, productstatus:productstatus(*)')
              .eq('productid', (payload.new as Product)?.productid || (payload.old as Product)?.productid)
              .single();

            if (payload.eventType === 'INSERT' && data) {
              const newProduct = { ...data, price: (data.productstatus as ProductStatusInfo)?.price ?? 'N/A' } as Product;
              setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
            } else if (payload.eventType === 'UPDATE' && data) {
              const updatedProduct = { ...data, price: (data.productstatus as ProductStatusInfo)?.price ?? 'N/A' } as Product;
              setProducts(prev => prev.map(p => p.productid === updatedProduct.productid ? updatedProduct : p).sort((a, b) => a.name.localeCompare(b.name)));
            } else if (payload.eventType === 'DELETE' && payload.old?.productid) {
                 if ((payload.old as Product).store === storeId) { // Double check storeId
                    setProducts(prev => prev.filter(p => p.productid !== (payload.old as Product).productid));
                 }
            }
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log(`RT: Subscribed to product changes for ${storeId}`);
      });
    
    return () => { supabase.removeChannel(productChannel); };
  }, [storeId, isSelected, supabase, isEditing]); // Add isEditing to dependencies

  // Effect to handle cooldown activation while editing
  useEffect(() => {
    if (isEditCooldownActive && isEditing) {
      cancelEdit();
      // Optionally: show a notification that editing was cancelled due to cooldown
      // setError("Editing cancelled: Cooldown is active."); // This might be too intrusive or override other errors
    }
  }, [isEditCooldownActive, isEditing]);


  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPaginationDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const sourceArray = isEditing ? draftProducts.filter(p => !p._isNew && !p._isDeleted) : products;
    if (currentPage < Math.ceil(sourceArray.length / itemsPerPage)) {
      setPaginationDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };
  
  const getPaginatedProductsToDisplay = useCallback(() => {
    const sourceArray = isEditing 
        ? draftProducts.filter(p => !p._isNew && !p._isDeleted) // Only existing for pagination
        : products;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sourceArray.slice(startIndex, startIndex + itemsPerPage);
  }, [isEditing, draftProducts, products, currentPage, itemsPerPage]);

  const getNewlyAddedDraftProducts = useCallback(() => {
    return isEditing ? draftProducts.filter(p => p._isNew && !p._isDeleted) : [];
  }, [isEditing, draftProducts]);


  const toggleStoreStatus = async () => {
    // This function is outside the scope of product drafting.
    if (!storeId || currentUser === "User") return;
    const newStatus = !isOpen;
    const { data: existingStatus, error: fetchErr } = await supabase
        .from('store')
        .select('storestatus')
        .eq('storeid', storeId)
        .single();

    if (fetchErr) { 
      console.error("Error fetching current status:", fetchErr); 
      return; 
    }

    let statusIdToUpdate = existingStatus?.storestatus;

    if (statusIdToUpdate) {
        const { error: updateErr } = await supabase
            .from('storestatus')
            .update({ status: newStatus })
            .eq('storestatusid', statusIdToUpdate);
        if (updateErr) { 
          console.error("Error updating status:", updateErr); 
          return; 
        }
    } else {
        const { data: newStatusData, error: insertErr } = await supabase
            .from('storestatus')
            .insert({ status: newStatus })
            .select('storestatusid')
            .single();
        if (insertErr || !newStatusData) { 
          console.error("Error creating status:", insertErr); 
          return; 
        }
        statusIdToUpdate = newStatusData.storestatusid;
        const { error: linkErr } = await supabase
            .from('store')
            .update({ storestatus: statusIdToUpdate })
            .eq('storeid', storeId);
        if (linkErr) { 
          console.error("Error linking new status:", linkErr);
          return; 
          }
    }
    setIsOpen(newStatus); // Update local UI state
  };


  const toggleEdit = () => {
    if (isEditCooldownActive) {
      // setError(globalCooldownError || "Cannot edit: Cooldown is active."); // Display the cooldown error
      return; // Prevent entering edit mode
    }
    if (!isEditing) {
      setDraftProducts(products.map(p => ({ ...p, _original: { ...p } })));
      setCurrentPage(1);
    } else {
      setDraftProducts([]);
    }
    setEditing(!isEditing);
  };

  const cancelEdit = () => {
    // No need to check isEditCooldownActive here, as cancelling is always allowed
    setDraftProducts([]);
    setEditing(false);
    setError(null);
    setCurrentPage(1);
    // Recalculate total pages based on the original products list
    setTotalPages(Math.ceil(products.length / itemsPerPage));
  };

  // --- Draft Mode Functions ---
  const handleDraftAddProduct = () => {
    if (isEditCooldownActive) return; // Prevent adding product if cooldown active

    const newTempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // More unique temp ID
    setDraftProducts(prev => [
      ...prev,
      {
        productid: newTempId,
        store: storeId,
        name: '', // Start with empty name
        price: '', // Start with empty price
        brand: storeName,
        productstatus: '',
        contributor: currentUser,
        datecreated: new Date().toISOString(),
        isarchived: false,
        _isNew: true,
      } as Product,
    ]);
    // No need to change current page, new products appear at the bottom.
  };

  const handleDraftProductChange = (productId: string, field: keyof Product, value: any) => {
    if (isEditCooldownActive) return; // Prevent changes if cooldown active
    setDraftProducts(prev =>
      prev.map(p => (p.productid === productId ? { ...p, [field]: value } : p))
    );
  };

  const handleDraftDeleteProduct = (productId: string) => {
    if (isEditCooldownActive) return; // Prevent deletion if cooldown active
    setDraftProducts(prev =>
      prev.map(p => {
        if (p.productid === productId) {
          // If it's a product that was newly added in this draft session, remove it completely
          if (p._isNew) return null; 
          // Otherwise, mark it for deletion
          return { ...p, _isDeleted: true };
        }
        return p;
      }).filter(p => p !== null) as Product[] // Filter out nulls (truly removed new items)
    );
  };
  // --- End Draft Mode Functions ---

  const saveEdit = async () => {
    if (isEditCooldownActive) {
      setError(globalCooldownError || "Cannot save: Cooldown is active.");
      return;
    }
    if (currentUser === "User") {
      setError("Login required to save changes.");
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      // 1. Handle Deletions: Products in original `products` but marked `_isDeleted` in `draftProducts`
      //    OR products in original `products` but entirely missing from `draftProducts` (if not simply marked)
      const productsToDelete = products.filter(originalProd => {
        const draftVersion = draftProducts.find(dp => dp.productid === originalProd.productid);
        return (draftVersion && draftVersion._isDeleted) || !draftProducts.some(dp => dp.productid === originalProd.productid);
      });

      for (const prodToDelete of productsToDelete) {
        // Ensure productstatus is the ID string if it's an object
        const statusId = typeof prodToDelete.productstatus === 'object' 
            ? (prodToDelete.productstatus as ProductStatusInfo).productstatusid 
            : prodToDelete.productstatus;

        await supabase.from('product').delete().eq('productid', prodToDelete.productid);
        if (statusId && typeof statusId === 'string') { // Only delete status if it's not shared and valid
          await supabase.from('productstatus').delete().eq('productstatusid', statusId);
        }
      }

      // 2. Handle Inserts: Products in `draftProducts` with `_isNew: true`
      const productsToInsert = draftProducts.filter(p => p._isNew && !p._isDeleted);
      for (const prodToInsert of productsToInsert) {
        const { data: newStatus, error: statusErr } = await supabase
          .from('productstatus')
          .insert({ contributor: currentUser, price: Number(prodToInsert.price) || 0, isavailable: true })
          .select('productstatusid')
          .single();
        if (statusErr || !newStatus) throw statusErr || new Error("Failed to create product status.");

        await supabase.from('product').insert({
          store: storeId,
          productstatus: newStatus.productstatusid,
          contributor: currentUser,
          brand: prodToInsert.brand || storeName,
          name: prodToInsert.name,
        });
      }

      // 3. Handle Updates: Products in `draftProducts` not new, not deleted, and different from original
      const productsToUpdate = draftProducts.filter(dp => !dp._isNew && !dp._isDeleted);
      for (const prodToUpdate of productsToUpdate) {
        const originalProd = products.find(p => p.productid === prodToUpdate.productid);
        let productChanged = false;
        let statusChanged = false;
        
        const updatePayload: Partial<Product> = {};
        if (originalProd && originalProd.name !== prodToUpdate.name) {
          updatePayload.name = prodToUpdate.name;
          productChanged = true;
        }
        // Add other product field checks here (e.g., brand)

        if (productChanged) {
          await supabase.from('product').update(updatePayload).eq('productid', prodToUpdate.productid);
        }
        
        // Handle price update (productstatus table)
        const originalPrice = typeof originalProd?.price === 'number' ? originalProd.price : parseFloat(String(originalProd?.price));
        const updatedPrice = typeof prodToUpdate.price === 'number' ? prodToUpdate.price : parseFloat(String(prodToUpdate.price));

        if (originalPrice !== updatedPrice && !isNaN(updatedPrice)) {
            const statusId = typeof prodToUpdate.productstatus === 'object' 
                ? (prodToUpdate.productstatus as ProductStatusInfo).productstatusid 
                : prodToUpdate.productstatus;
            if (statusId && typeof statusId === 'string') {
                 await supabase.from('productstatus').update({ price: updatedPrice, contributor: currentUser }).eq('productstatusid', statusId);
                 statusChanged = true;
            }
        }
        // If either changed, and you want to "touch" product for RT update if only status changed:
        if (statusChanged && !productChanged) {
            await supabase.from('product').update({ updated_at: new Date().toISOString() }).eq('productid', prodToUpdate.productid);
        }

      }

      // After all operations, fetch the true state from DB
      const { data: updatedProductsData, error: fetchError } = await supabase
      .from('product')
      .select('*, productstatus:productstatus(*)')
      .eq('store', storeId)
      .order('name', { ascending: true });

      if (fetchError) {
          console.error("Error re-fetching products after save:", fetchError);
          // Keep draft products in view if fetch fails, or show error
          setError("Changes saved, but failed to refresh product list.");
      } else if (updatedProductsData) {
      const processed = updatedProductsData.map(p => ({
          ...p,
          price: (p.productstatus as ProductStatusInfo)?.price ?? 'N/A',
          productstatus: p.productstatus,
      })) as Product[];
      setProducts(processed);
      setDraftProducts([]); // Clear draft
      setEditing(false);
      setCurrentPage(1); // Go back to page 1 of the new list
      } else {
      // Handle case where fetch returns no data but no error
      setProducts([]);
      setDraftProducts([]);
      setEditing(false);
      setCurrentPage(1);
      }
  
    } catch (error: any) {
    console.error("Error saving edits:", error.message);
    setError("Failed to save changes: " + error.message);
    } finally {
    setIsSaving(false);
    }
  };
  
  const getStoreEmoji = (type: string | null): string => {
    if (!type) return "🏪"; const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'eatery': return "🍴"; case 'pie': return "🥧"; case 'restroom': return "🚻";
      case 'clothing': return "👕"; case 'pizza': return "🍕"; case 'cookie': return "🍪";
      case 'notebook': return "📓"; case 'printer': return "🖨️"; case 'basket': return "🧺";
      case 'veggie': return "🥕"; case 'meat': return "🥩"; case 'personnel': return "👥";
      case 'park': return "🌳"; case 'water': return "💧"; case 'haircut': return "✂️";
      case 'mail': return "✉️"; case 'money': return "💰"; case 'coffee': return "☕";
      case 'milk': return "🥛"; default: return "🏪";
    }
  };

  const paginatedProductsToDisplay = getPaginatedProductsToDisplay();
  const newlyAddedDraftProducts = getNewlyAddedDraftProducts();

  return (
    <AnimatePresence mode="wait" initial={false}> 
      {isSelected && storeId && (
        <motion.div
          key={storeId} // Ensure re-animation if storeId changes
          className="bg-white grid grid-rows-[auto_1fr] md:grid-rows-[120px_1fr] h-full rounded-[15px] shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {/* Header */}
          <motion.div 
            className="w-full relative"
            layoutId={`background-container-${storeId}`} // Unique layoutId
          >
            <motion.img layoutId={`background-image-${storeId}`} src={BackgroundImage.src} alt="Background"
              className="absolute z-0 w-full h-full object-cover rounded-t-[15px]" />
            <motion.div className="absolute z-1 bg-black bg-opacity-40 w-full h-full rounded-t-[15px]" />
            
            {currentUser !== "User" && (
                <motion.div 
                className="pointer-events-auto absolute -right-2 -top-1 sm:-right-12 sm:-top-2 md:-right-4 md:top-1 z-20 transform scale-[0.3] sm:scale-[0.35] md:scale-[0.4]"
                initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: 1, scale: 0.4 }} exit={{ opacity: 0, scale: 0.2 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                >
                <Button className="bg-transparent hover:bg-transparent w-[210px] h-[100px] p-0 z-9 rounded-[30px] focus:ring-0 active:scale-95" 
                        onClick={toggleStoreStatus} aria-label={isOpen ? "Mark store as closed" : "Mark store as open"}>  
                    <StoreStatusCard isOpen={isOpen || false} />
                </Button>
                </motion.div>
            )}

            <motion.div className="relative pt-3 pl-3 md:pt-4 md:pl-4 z-10"
              initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white line-clamp-2 w-[75%] sm:w-[80%]">{storeName}</h1>
            </motion.div>          
            <motion.div className="absolute bottom-2 left-3 md:bottom-3 md:left-4 z-10"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>   
               <span className="bg-white text-emerald-700 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs rounded-full font-semibold flex items-center shadow-sm">
                <span className="mr-1 text-xs md:text-sm">{getStoreEmoji(storeType)}</span> 
                <span className="whitespace-nowrap">
                  {storeDetailsLoading ? "..." : (storeType && storeType !== 'N/A' ? storeType.charAt(0).toUpperCase() + storeType.slice(1) : "Store")}
                </span>
              </span>
            </motion.div>  
          </motion.div>
          
          {/* Products section */}
          <div className="w-full overflow-hidden flex flex-col justify-between rounded-b-[15px]">
            <div className="px-3 pt-2 md:px-4 md:pt-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-700">Products/Services</h2>
              {isEditCooldownActive && globalCooldownError && (
                <p className="text-red-500 text-sm pt-1">{globalCooldownError}</p>
              )}
            </div>

            {/* If cooldown is active, perhaps hide the product list entirely or show a simplified message */}
            {/* For now, inputs will be disabled, and error message shown above. */}
            <div className="overflow-y-auto flex-grow px-3 md:px-4 pb-2
                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 
                [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {loading && !products.length && !isEditing ? ( <p>Loading...</p>
              ) : error && !globalCooldownError ? ( <p className="text-red-500">{error}</p> // Don't show general error if cooldown error is shown
              ) : (isEditing ? draftProducts.filter(p => !p._isDeleted && !p._isNew).length === 0 : products.length === 0) && 
                  newlyAddedDraftProducts.length === 0 && !isEditing && !isEditCooldownActive ? ( // Only show "No products" if not in cooldown
                <p className="text-gray-500 text-center py-4">
                  {isEditing ? "No existing products to edit. Add some!" : "No products found."}
                </p>
              ) : (
                <>
                  {/* Header for product list (Name | Price) */}
                  { (paginatedProductsToDisplay.length > 0 || newlyAddedDraftProducts.length > 0 || isEditing) && (
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-200 sticky top-0 bg-white z-[5]">
                      <div className="font-medium text-gray-500 text-xs md:text-sm">Name</div>
                      <div className="font-medium text-gray-500 text-xs md:text-sm text-right -mr-3">Price</div>
                      {isEditing && <div className="w-6 h-1"></div>}
                    </div>
                  )}

                  {/* Paginated Existing/Draft Products */}
                  <AnimatePresence mode="wait" custom={paginationDirection}>
                    <motion.div
                      key={currentPage}
                      custom={paginationDirection}
                      variants={pageVariants}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                      className="space-y-1.5 mt-1"
                    >
                      {paginatedProductsToDisplay.map((product) => (
                        <motion.div 
                          key={product.productid}
                          layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: {duration: 0.2} }}
                          transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-100"
                        >
                          {isEditing ? (
                            <>
                              <input 
                                type="text" 
                                disabled={isEditCooldownActive}
                                value={product.name} // Controlled component from draft
                                onChange={(e) => handleDraftProductChange(product.productid, 'name', e.target.value)}
                                className="bg-gray-50 text-black text-xs md:text-sm p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 min-w-0"
                                placeholder="Product Name"
                              />
                              <input 
                                type="number"
                                disabled={isEditCooldownActive}
                                value={String(product.price).replace(/^0+(?=\d)/, '')} // Controlled, remove leading zeros unless it's just "0"
                                onChange={(e) => handleDraftProductChange(product.productid, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="bg-gray-50 text-black text-right text-xs md:text-sm w-20 p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Price"
                                step="1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleDraftDeleteProduct(product.productid)} disabled={isEditCooldownActive}
                                className="text-red-500 hover:bg-red-100 h-7 w-7 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-gray-700 text-xs md:text-sm truncate" title={product.name}>{product.name}</div>
                              <div className="-mr-9 text-gray-700 font-medium text-xs md:text-sm text-right whitespace-nowrap">
                                {typeof product.price === 'number' ? `₱${product.price}` : (product.price || "N/A")}
                              </div>
                               <div className="w-6 h-1"></div> {/* Spacer to match edit mode */}
                            </>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Newly Added Draft Products */}
                  {isEditing && newlyAddedDraftProducts.length > 0 && (
                     <div className="mt-3 pt-2 border-t border-dashed border-gray-300">
                       <h3 className="text-xs text-gray-500 mb-1.5 px-1">New Products (Draft)</h3>
                       <div className="space-y-1.5">
                         {newlyAddedDraftProducts.map((product) => (
                            <motion.div 
                            key={product.productid}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-100"
                          >
                            <input type="text" value={product.name} disabled={isEditCooldownActive}
                              onChange={(e) => handleDraftProductChange(product.productid, 'name', e.target.value)}
                              className="bg-gray-50 text-black text-xs md:text-sm p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 min-w-0"
                              placeholder="Product Name" />
                            {/* Price input with pr-0.5 for alignment */}
                            <input type="number" value={String(product.price).replace(/^0+(?=\d)/, '')} disabled={isEditCooldownActive}
                              onChange={(e) => handleDraftProductChange(product.productid, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                              className="bg-gray-50 text-black text-right text-xs md:text-sm w-20 p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-0.5"
                              placeholder="Price" step="1" />
                            <Button variant="ghost" size="icon" 
                              onClick={() => handleDraftDeleteProduct(product.productid)} 
                              disabled={isEditCooldownActive}
                              className="text-red-500 hover:bg-red-100 h-7 w-7 p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                            </Button>
                          </motion.div>
                         ))}
                       </div>
                     </div>
                   )}


                  {isEditing && currentUser !== "User" && (
                    <Button variant="outline" size="sm" 
                      onClick={handleDraftAddProduct} 
                      disabled={isEditCooldownActive}
                      className="w-full mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3 mr-1.5" fill="currentColor"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0-32-14.3-32-32s-14.3-32-32-32H256V80z"/></svg>
                      Add Product
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Pagination controls */}
            <div className="border-t border-gray-200 px-2 py-1.5 md:py-2">
              <div className="flex justify-between items-center w-full">
                <Button variant="ghost" size="sm" onClick={handlePrevPage} 
                  disabled={isEditCooldownActive || currentPage === 1 || (isEditing ? draftProducts.filter(p=>!p._isDeleted).length === 0 : products.length === 0)}
                  className="text-emerald-700 hover:text-emerald-700 disabled:text-gray-400 hover:bg-emerald-50 px-1 sm:px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="ml-1 hidden sm:inline text-xs">Prev</span>
                </Button>

                <div className="flex-grow flex justify-center items-center space-x-1 sm:space-x-2 px-1">
                  {currentUser !== "User" && (isEditing ? (
                    <>
                      <Button size="sm" onClick={saveEdit} disabled={isEditCooldownActive || isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3">
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit} disabled={isEditCooldownActive || isSaving} className="border-gray-300 text-gray-600 hover:bg-gray-100 text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3">Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={toggleEdit} disabled={isEditCooldownActive} className="text-gray-600 hover:bg-gray-100 hover:text-black text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="sm:mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                      <span className="hidden sm:inline">Edit Products</span>
                    </Button>
                  ))}
                </div>

                <Button variant="ghost" size="sm" onClick={handleNextPage} 
                  disabled={isEditCooldownActive || currentPage === totalPages || totalPages <= 1 || (isEditing ? draftProducts.filter(p=>!p._isDeleted).length === 0 : products.length === 0)}
                  className="text-emerald-700 hover:text-emerald-700 disabled:text-gray-400 hover:bg-emerald-50 px-1 sm:px-2">
                  <span className="mr-1 hidden sm:inline text-xs">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoreCard;