'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import BackgroundImage from '@/components/assets/background-images/Background.png';
import StoreStatusCard from './store-status-card';
import { useMapSearch } from '@/components/map-search-context';
import { Button } from './button';
import { useEditCooldown } from '../cooldown-context'; // Ensure this path is correct

type ProductStatusInfo = {
  productstatusid: string;
  price: number;
  isavailable: boolean;
  contributor: string;
};

type Product = {
  productid: string;
  store: string;
  productstatus: ProductStatusInfo | string; // Can be the full object or just the ID string
  contributor: string;
  brand: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
  price: number | string; // This is derived for display; actual price is in productstatus
  description?: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _original?: Product; // Stores the original state when editing
};

type StoreComponentProps = {
  storeId?: string,
  isSelected?: boolean,
  storeName?: string,
}

const pageVariants: Variants = {
  initial: (direction: number) => ({ 
    x: direction > 0 ? "50%" : "-50%", 
    opacity: 0,
    scale: 0.95
  }),
  enter: { 
    x: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, // Reduced from 300
      damping: 20,    // Reduced from 30
      mass: 1,
      restDelta: 0.001,
      duration: 0.6   // Added explicit duration
    } 
  },
  exit: (direction: number) => ({ 
    x: direction < 0 ? "50%" : "-50%", 
    opacity: 0,
    scale: 0.95,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20, 
      mass: 1,
      restDelta: 0.001,
      duration: 0.4
    } 
  }),
};


const productItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1, // Stagger effect
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

// Security function from the new (good security) version
const checkForMaliciousInput = (input: string): boolean => {
    if (typeof input !== 'string' || !input.trim()) return false;
    let normalizedInput = input.toLowerCase();
    try {
        normalizedInput = decodeURIComponent(normalizedInput.replace(/\+/g, ' '));
    } catch (e) {
        // console.warn("Error decoding input, proceeding with lowercased original:", e);
    }
    const patterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, /<iframe\b[^>]*>/gi,
        /<svg\b[^>]*>/gi, /<img\b[^>]*onerror\s*=/gi, /<[a-z]+\s+on\w+\s*=/gi,
        /javascript\s*:/gi, /\s?UNION\s+SELECT/gi, /\s?SELECT\s+.*?\s+FROM\b/gi,
        /\s?OR\s+(['"]?\w+['"]?)\s*=\s*\1/gi, /--/gi, /;.*--/gi,
        /\b(xp_cmdshell|SLEEP\s*\()/gi, /(\%27)|(\')|(\%23)|(#)/gi,
        /<img\b[^>]*>/gi, /<meta\b[^>]*>/gi, /<base\b[^>]*>/gi,
        /vbscript\s*:/gi, /expression\s*\(/gi, /url\s*\(\s*['"]?\s*javascript:/gi,                    
        /\b(alert|confirm|prompt)\s*\(/gi,
        /\b(document\.cookie|document\.write|window\.location|eval|setTimeout|setInterval)\b/gi,
        /;\s*(DROP|ALTER|TRUNCATE|DELETE\s+FROM)\b/gi,
        /\.\.\//gi, /\.\.\\/gi,
    ];
    for (const pattern of patterns) {
        if (pattern.test(input) || pattern.test(normalizedInput)) {
            console.warn("Client-side malicious pattern detected:", pattern.source, "in input substring:", input.substring(0, 70));
            return true;
        }
    }
    return false;
};

const PRODUCT_NAME_MAX_LENGTH = 30;

const StoreCard: React.FC<StoreComponentProps> = ({ 
    storeId = "",
    isSelected = false,
    storeName = "",
  }) => {
    const supabase = createClient();
    const {isOpen, setIsOpen} = useMapSearch();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [products, setProducts] = useState<Product[]>([]);
    const [localError, setLocalError] = useState<string | null>(null); 
    const [currentUser, setCurrentUser] = useState<string>("User");
    const [storeType, setStoreType] = useState<string | null>(null);
    const [paginationDirection, setPaginationDirection] = useState(0);
    const [draftProducts, setDraftProducts] = useState<Product[]>([]);
    const [storeDetailsLoading, setStoreDetailsLoading] = useState(false);
    const [showSecurityAlertDialog, setShowSecurityAlertDialog] = useState(false);

    const componentRef = useRef<HTMLDivElement>(null);
    const prevButtonRef = useRef<HTMLButtonElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);

    const scareTacticsEnabled = process.env.NEXT_PUBLIC_ENABLE_SCARE_TACTICS === 'true';
    
    const { 
        isEditCooldownActive, 
        triggerGlobalEditCooldown, 
        getGlobalCooldownRemainingTime,
        globalCooldownError,
        clearGlobalCooldownError
    } = useEditCooldown();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user.id);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const element = componentRef.current;
    if (!element || !isSelected || !storeId) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        let newItemsPerPage;
        if (height <= 466) newItemsPerPage = 5;
        else if (height <= 520) newItemsPerPage = 6;
        else if (height <= 660) newItemsPerPage = 8;
        else newItemsPerPage = 9;
        setItemsPerPage(current => current !== newItemsPerPage ? (setCurrentPage(1), newItemsPerPage) : current);
      }
    });
    observer.observe(element);
    return () => { if (element) observer.unobserve(element); observer.disconnect(); };
  }, [isSelected, storeId, setCurrentPage]);

  useEffect(() => {
    if (storeId && isSelected) {
      setProducts([]); setDraftProducts([]); setStoreType(null);
      setCurrentPage(1); setLocalError(null);
      // if (isEditCooldownActive) { setEditing(false); } // Already handled by toggleEdit check
      // else { setEditing(false); }
      setEditing(false); // Always reset editing mode when store changes
      if (scareTacticsEnabled) setShowSecurityAlertDialog(false);

      const fetchStoreDetailsAndProducts = async () => {
        setStoreDetailsLoading(true); setLoading(true);
        try {
          const { data: storeInfo, error: storeInfoError } = await supabase.from('store').select('store_type, storestatus (status)').eq('storeid', storeId).single();
          if (storeInfoError) console.error('Error fetching store info:', storeInfoError.message);
          else if (storeInfo) {
            setStoreType(storeInfo.store_type || 'N/A');
            const storeStatusFK = storeInfo.storestatus as object as ({ status: boolean; } | null);
            setIsOpen(storeStatusFK?.status ?? false);
          }
          const { data: productsData, error: productsError } = await supabase.from('product').select('*, productstatus:productstatus(*)').eq('store', storeId).order('name', { ascending: true });
          if (productsError) throw productsError;

          const processed = (productsData || []).map(p => ({ 
              ...p, 
              price: (p.productstatus as ProductStatusInfo)?.price ?? 'N/A', 
              productstatus: p.productstatus 
          })) as Product[];
          setProducts(processed);

        } catch (err: any) {
          console.log('Error fetching initial data:', err); setLocalError('Failed to load store data.'); setStoreType('Error');
        } finally {
          setStoreDetailsLoading(false); setLoading(false);
        }
      };
      fetchStoreDetailsAndProducts();
    } else {
      setProducts([]); setDraftProducts([]); setStoreType(null); setEditing(false);
    }
  }, [storeId, isSelected, supabase, setIsOpen, scareTacticsEnabled]); // Removed isEditCooldownActive from here as it's not directly controlling this fetch logic

  useEffect(() => {
    const sourceArray = isEditing ? draftProducts.filter(p => !p._isDeleted) : products; 
    setTotalPages(Math.ceil(sourceArray.length / itemsPerPage));
  }, [products, draftProducts, itemsPerPage, isEditing]);

  useEffect(() => { 
    if (!storeId || !isSelected || isEditing) return; 
    const productChannel = supabase.channel(`product-changes-rt-${storeId}`).on<Product>(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'product', filter: `store=eq.${storeId}` }, 
        async (payload) => {
            if (!isEditing) { 
              const productId = (payload.new as Product)?.productid || (payload.old as Product)?.productid;
              if (!productId) return;

              const { data, error } = await supabase.from('product')
                .select('*, productstatus:productstatus(*)')
                .eq('productid', productId)
                .single();

              if (error) {
                console.error("Error fetching product for RT update:", error);
                return;
              }

              if (payload.eventType === 'INSERT' && data) { 
                setProducts(prev => [...prev, { ...data, price: (data.productstatus as ProductStatusInfo)?.price ?? 'N/A' } as Product].sort((a,b)=>a.name.localeCompare(b.name)));
              } else if (payload.eventType === 'UPDATE' && data) { 
                setProducts(prev => prev.map(p => p.productid === data.productid ? ({ ...data, price: (data.productstatus as ProductStatusInfo)?.price ?? 'N/A' } as Product) : p).sort((a,b)=>a.name.localeCompare(b.name)));
              } else if (payload.eventType === 'DELETE' && payload.old?.productid) { 
                if ((payload.old as Product).store === storeId) { 
                    setProducts(prev => prev.filter(p => p.productid !== (payload.old as Product).productid)); 
                }
              }
            }
        }
    ).subscribe(status => { if (status === 'SUBSCRIBED') console.log(`RT: Subscribed to product changes for ${storeId}`); });
    return () => { supabase.removeChannel(productChannel); };
  }, [storeId, isSelected, supabase, isEditing]); 

  const handlePrevPage = () => { if (currentPage > 1) { setPaginationDirection(-1); setCurrentPage(currentPage - 1); prevButtonRef.current?.blur(); }};
  const handleNextPage = () => { 
      const sourceArray = isEditing ? draftProducts.filter(p => !p._isNew && !p._isDeleted) : products; 
      if (currentPage < Math.ceil(sourceArray.length / itemsPerPage)) {
          setPaginationDirection(1); 
          setCurrentPage(currentPage + 1); 
          nextButtonRef.current?.blur(); 
      }
  };
  const getPaginatedProductsToDisplay = useCallback(() => { 
      const sourceArray = isEditing ? draftProducts.filter(p => !p._isNew && !p._isDeleted) : products; 
      const startIndex = (currentPage - 1) * itemsPerPage; 
      return sourceArray.slice(startIndex, startIndex + itemsPerPage); 
  }, [isEditing, draftProducts, products, currentPage, itemsPerPage]);
  const getNewlyAddedDraftProducts = useCallback(() => isEditing ? draftProducts.filter(p => p._isNew && !p._isDeleted) : [], [isEditing, draftProducts]);
  
  const toggleStoreStatus = async () => {
    // *** MODIFICATION 1: Check for cooldown ***
    if (isEditCooldownActive) {
        // Optionally, you could set a localError here if you want to inform the user
        // setLocalError("Cannot change store status while cooldown is active.");
        return;
    }
    if (!storeId || currentUser === "User") return;
    
    const newStatus = !isOpen;
    const { data: existingStore, error: fetchErr } = await supabase.from('store').select('storestatus').eq('storeid', storeId).single();
    if (fetchErr) { console.error("Error fetching current storestatus FK:", fetchErr); return; }
    
    let statusIdToUpdate = existingStore?.storestatus;

    if (statusIdToUpdate) {
      const { error: updateErr } = await supabase.from('storestatus').update({ status: newStatus }).eq('storestatusid', statusIdToUpdate);
      if (updateErr) { console.error("Error updating status:", updateErr); return; }
    } else {
      const { data: newStatusData, error: insertErr } = await supabase.from('storestatus').insert({ status: newStatus, contributor: currentUser }).select('storestatusid').single();
      if (insertErr || !newStatusData) { console.error("Error creating status:", insertErr); return; }
      statusIdToUpdate = newStatusData.storestatusid;
      const { error: linkErr } = await supabase.from('store').update({ storestatus: statusIdToUpdate }).eq('storeid', storeId);
      if (linkErr) { console.error("Error linking new status:", linkErr); return; }
    }
    setIsOpen(newStatus);
  };

  const toggleEdit = () => { 
    if (isEditCooldownActive && !isEditing) { 
        return; 
    }
    if (!isEditing) { 
      setDraftProducts(products.map(p => ({ 
          ...p, 
          _original: { ...p, productstatus: typeof p.productstatus === 'object' ? {...p.productstatus} : p.productstatus } 
      }))); 
      setCurrentPage(1); 
      setLocalError(null); 
      clearGlobalCooldownError();
      if (scareTacticsEnabled) setShowSecurityAlertDialog(false);
    } else { 
      setDraftProducts([]); 
    } 
    setEditing(!isEditing); 
  };

  const cancelEdit = () => { 
    setDraftProducts([]); setEditing(false); setLocalError(null); setCurrentPage(1); 
    setTotalPages(Math.ceil(products.length / itemsPerPage)); 
    if (scareTacticsEnabled) setShowSecurityAlertDialog(false); 
    clearGlobalCooldownError();
  };

  const handleDraftProductChange = (productId: string, field: keyof Product, value: any) => {
    if (isEditCooldownActive && field !== '_isDeleted') return; 

    if (field === 'name' && typeof value === 'string') {
        if (checkForMaliciousInput(value)) {
            if (scareTacticsEnabled) {
                setShowSecurityAlertDialog(true);
            } else {
                triggerGlobalEditCooldown();
                setEditing(false); 
                setDraftProducts([]); 
            }
            return; 
        }
        if (value.length > PRODUCT_NAME_MAX_LENGTH) {
            setLocalError(`Product name cannot exceed ${PRODUCT_NAME_MAX_LENGTH} characters.`);
        } else {
            setLocalError(null); 
        }
    }
    
    if (field === 'price') {
        if (value === '') {
        } else {
            const numValue = parseFloat(String(value));
            if (isNaN(numValue)) {
                console.warn("Invalid price input (non-numeric):", value);
            } else if (numValue < 0) {
                 setLocalError("Price cannot be negative.");
            } else {
                 setLocalError(null);
            }
        }
    }

    setDraftProducts(prev => prev.map(p => {
        if (p.productid === productId) {
            let processedValue = value;
            if (field === 'name' && typeof value === 'string' && value.length > PRODUCT_NAME_MAX_LENGTH) {
                processedValue = value.substring(0, PRODUCT_NAME_MAX_LENGTH);
            }
            return { ...p, [field]: processedValue };
        }
        return p;
    }));
  };

  const handleDraftAddProduct = () => { 
    if (isEditCooldownActive) return;
    const newTempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
    setDraftProducts(prev => [...prev, { 
        productid: newTempId, 
        store: storeId, 
        name: '', 
        price: '', 
        brand: storeName, 
        productstatus: '', 
        contributor: currentUser, 
        datecreated: new Date().toISOString(), 
        isarchived: false, 
        _isNew: true 
    } as Product]); 
  };
  const handleDraftDeleteProduct = (productId: string) => { 
    if (isEditCooldownActive) return;
    setDraftProducts(prev => prev.map(p => 
        p.productid === productId ? (p._isNew ? null : { ...p, _isDeleted: true }) : p
    ).filter(p => p !== null) as Product[]); 
  };

  const saveEdit = async () => {
    if (isEditCooldownActive) { 
        setLocalError(globalCooldownError || "Cannot save: Cooldown is active.");
        return;
    }
    if (currentUser === "User") { setLocalError("Login required to save changes."); return; }

    setIsSaving(true); setLocalError(null); clearGlobalCooldownError();

    for (const draft of draftProducts) {
        if (draft._isDeleted) continue;

        if (checkForMaliciousInput(draft.name)) {
            if (scareTacticsEnabled) { setShowSecurityAlertDialog(true); } 
            else { triggerGlobalEditCooldown(); setEditing(false); setDraftProducts([]); }
            setIsSaving(false); return; 
        }
        if (draft.name.length > PRODUCT_NAME_MAX_LENGTH) {
            setLocalError(`Product name "${draft.name.substring(0,20)}..." exceeds ${PRODUCT_NAME_MAX_LENGTH} characters.`);
            setIsSaving(false); return;
        }
        if (!draft.name.trim()) {
            setLocalError(`Product name cannot be empty for "${draft.productid.startsWith('temp-') ? 'new product' : draft.name}".`);
            setIsSaving(false); return;
        }

        if (draft.brand && checkForMaliciousInput(draft.brand)) {
             if (scareTacticsEnabled) { setShowSecurityAlertDialog(true); } 
             else { triggerGlobalEditCooldown(); setEditing(false); setDraftProducts([]); }
             setIsSaving(false); return;
        }
        const priceValue = String(draft.price).trim();
        if (priceValue !== '') {
            const numericPrice = parseFloat(priceValue);
            if (isNaN(numericPrice) || numericPrice < 0) {
                setLocalError(`Invalid price for product "${draft.name}". Price must be a positive number or empty.`);
                setIsSaving(false); return;
            }
        }
    }

    try {
      const productsToDelete = products.filter(originalProd => {
        const draftVersion = draftProducts.find(dp => dp.productid === originalProd.productid);
        return (draftVersion && draftVersion._isDeleted) || !draftProducts.some(dp => dp.productid === originalProd.productid && !dp._isDeleted);
      });

      for (const prodToDelete of productsToDelete) {
        await supabase.from('product').delete().eq('productid', prodToDelete.productid);
        const statusId = typeof prodToDelete.productstatus === 'object' 
            ? (prodToDelete.productstatus as ProductStatusInfo).productstatusid 
            : prodToDelete.productstatus;
        if (statusId && typeof statusId === 'string') { 
          await supabase.from('productstatus').delete().eq('productstatusid', statusId); 
        }
      }

      const productsToInsert = draftProducts.filter(p => p._isNew && !p._isDeleted);
      for (const prodToInsert of productsToInsert) {
        const priceToSave = Number(String(prodToInsert.price).trim()) || 0; 
        const { data: newStatus, error: statusErr } = await supabase
          .from('productstatus')
          .insert({ contributor: currentUser, price: priceToSave, isavailable: true })
          .select('productstatusid')
          .single();
        if (statusErr || !newStatus) throw statusErr || new Error("Failed to create product status.");

        await supabase.from('product').insert({
          store: storeId,
          productstatus: newStatus.productstatusid,
          contributor: currentUser,
          brand: prodToInsert.brand || storeName, 
          name: prodToInsert.name.substring(0, PRODUCT_NAME_MAX_LENGTH).trim(), 
        });
      }

      const productsToUpdate = draftProducts.filter(dp => !dp._isNew && !dp._isDeleted);
      for (const draftProd of productsToUpdate) { 
        const originalProd = products.find(p => p.productid === draftProd.productid);
        if (!originalProd) continue; 

        let productChanged = false;
        let statusChanged = false;
        
        const productUpdatePayload: Partial<Omit<Product, 'productstatus' | 'price'>> & { productstatus?: string } = {};

        if (originalProd.name !== draftProd.name.substring(0, PRODUCT_NAME_MAX_LENGTH).trim()) {
          productUpdatePayload.name = draftProd.name.substring(0, PRODUCT_NAME_MAX_LENGTH).trim();
          productChanged = true;
        }
        if (originalProd.brand !== draftProd.brand) { 
          productUpdatePayload.brand = draftProd.brand;
          productChanged = true;
        }
        
        if (productChanged) {
          await supabase.from('product').update(productUpdatePayload).eq('productid', draftProd.productid);
        }
        
        const originalStatusObj = originalProd.productstatus as ProductStatusInfo;
        const originalPriceValue = originalStatusObj?.price; 

        const draftPriceStr = String(draftProd.price).trim();
        const draftPriceNum = draftPriceStr === '' ? 0 : parseFloat(draftPriceStr); 

        if (!isNaN(draftPriceNum) && draftPriceNum >= 0 && originalPriceValue !== draftPriceNum) {
            const statusId = typeof draftProd.productstatus === 'object' 
                ? (draftProd.productstatus as ProductStatusInfo).productstatusid 
                : draftProd.productstatus; 

            if (statusId && typeof statusId === 'string') {
                 await supabase.from('productstatus')
                              .update({ price: draftPriceNum, contributor: currentUser }) 
                              .eq('productstatusid', statusId);
                 statusChanged = true;
            } else {
                console.warn("Could not find statusId to update price for product:", draftProd.name);
            }
        }
        
        if (statusChanged && !productChanged) { 
            await supabase.from('product').update({ updated_at: new Date().toISOString() }).eq('productid', draftProd.productid);
        }
      }

      const { data: updatedProductsData, error: fetchError } = await supabase
        .from('product')
        .select('*, productstatus:productstatus(*)')
        .eq('store', storeId)
        .order('name', { ascending: true });

      if (fetchError) {
          console.error("Error re-fetching products after save:", fetchError);
          setLocalError("Changes saved, but failed to refresh product list.");
      } else if (updatedProductsData) {
        const processed = updatedProductsData.map(p => ({
            ...p,
            price: (p.productstatus as ProductStatusInfo)?.price ?? 'N/A',
            productstatus: p.productstatus,
        })) as Product[];
        setProducts(processed);
        setDraftProducts([]); 
        setEditing(false);
        setCurrentPage(1); 
      } else {
        setProducts([]);
        setDraftProducts([]);
        setEditing(false);
        setCurrentPage(1);
      }
  
    } catch (error: any) {
        console.error("Error saving edits:", error.message);
        setLocalError("Failed to save changes: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };
  
  const getStoreEmoji = (type: string | null): string => { if (!type) return "🏪"; const lt=type.toLowerCase(); switch(lt){case 'eatery':return "🍴";case 'pie':return "🥧";case 'restroom':return "🚻";case 'clothing':return "👕";case 'pizza':return "🍕";case 'cookie':return "🍪";case 'notebook':return "📓";case 'printer':return "🖨️";case 'basket':return "🧺";case 'veggie':return "🥕";case 'meat':return "🥩";case 'personnel':return "👥";case 'park':return "🌳";case 'water':return "💧";case 'haircut':return "✂️";case 'mail':return "✉️";case 'money':return "💰";case 'coffee':return "☕";case 'milk':return "🥛";default:return "🏪";}};

  const paginatedProductsToDisplay = getPaginatedProductsToDisplay();
  const newlyAddedDraftProducts = getNewlyAddedDraftProducts();

  return (
    <>
      <AnimatePresence>
        {scareTacticsEnabled && showSecurityAlertDialog && (
            <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSecurityAlertDialog(false)} >
                <motion.div className="bg-black p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-sm w-full border border-red-700" initial={{ scale: 0.7, opacity: 0, y: -50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.7, opacity: 0, y: -50 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} onClick={(e) => e.stopPropagation()} >
                    <h2 className="text-xl sm:text-2xl font-black text-red-500 mb-4 tracking-wider"> WE KNOW WHO YOU ARE. </h2>
                    <Button onClick={() => setShowSecurityAlertDialog(false)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black" > Continue Editing </Button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>

      <AnimatePresence mode="wait" initial={true}> 
        {isSelected && storeId && (
          <motion.div ref={componentRef} key={storeId} className="bg-white grid grid-rows-[140px_1fr] md:grid-rows-[120px_1fr] h-full rounded-[15px] shadow-md overflow-hidden" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: "easeInOut" }} >
            <motion.div className="w-full relative h-full" layoutId={`background-container-${storeId}`} >
              <motion.img layoutId={`background-image-${storeId}`} src={BackgroundImage.src} alt="Background" className="absolute z-0 w-full h-full object-cover rounded-t-[15px]" />
              <motion.div className="absolute z-1 bg-black bg-opacity-40 w-full h-full rounded-t-[15px]" />
              {currentUser !== "User" && (
                  <motion.div 
                    className={`pointer-events-auto absolute -right-14 -top-2 scale-[0.3] sm:scale-[0.35] md:scale-[0.4] z-20 ${isEditCooldownActive ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    initial={{ opacity: 0, scale: 0.2 }} 
                    animate={{ opacity: 1, scale: 0.4 }} 
                    exit={{ opacity: 0, scale: 0.2 }} 
                    transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }} 
                  >
                  {/* *** MODIFICATION 2: Disable button and adjust style *** */}
                  <Button 
                    className={`bg-transparent hover:bg-transparent w-[210px] h-[100px] p-0 z-9 rounded-[30px] focus:ring-0 active:scale-95 ${isEditCooldownActive ? 'pointer-events-none' : ''}`} 
                    onClick={toggleStoreStatus} 
                    aria-label={isOpen ? "Mark store as closed" : "Mark store as open"}
                    disabled={isEditCooldownActive} // Add disabled prop
                  >  
                      <StoreStatusCard isOpen={isOpen ?? false} /> 
                  </Button>
                  </motion.div>
              )}
              <div className="relative z-10 h-full flex flex-col justify-between p-3 md:block md:p-4 md:justify-normal">
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} >
                  <h1 className="text-lg xs:text-[15px] sm:text-xs md:text-sm lg:text-2xl font-bold text-white line-clamp-2 w-[75%] sm:w-[80%]">{storeName}</h1>
                </motion.div>
                <motion.div className="self-start md:absolute md:bottom-2 md:left-4 md:self-auto" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} >   
                   <span className="bg-white text-emerald-700 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs rounded-full font-semibold flex items-center shadow-sm">
                    <span className="mr-1 text-xs md:text-sm">{getStoreEmoji(storeType)}</span> 
                    <span className="whitespace-nowrap"> {storeDetailsLoading ? "..." : (storeType && storeType !== 'N/A' ? storeType.charAt(0).toUpperCase() + storeType.slice(1) : "Store")} </span>
                  </span>
                </motion.div>
              </div>
            </motion.div>
            
            <div className="w-full overflow-hidden flex flex-col justify-between rounded-b-[15px]">
              <div className="px-3 pt-2 md:px-4 md:pt-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-700">Products/Services</h2>
                {localError && !(isEditCooldownActive && globalCooldownError) && <p className="text-xs text-red-500 mt-1">{localError}</p>}
                {!scareTacticsEnabled && isEditCooldownActive && globalCooldownError && <p className="text-xs text-red-500 mt-1">{globalCooldownError}</p>}
              </div>
              <div className="overflow-y-auto flex-grow px-3 md:px-4 pt-1 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full" >
                {loading && !products.length && !isEditing ? ( <p>Loading products...</p>
                ) : (isEditing ? draftProducts.filter(p => !p._isDeleted && !p._isNew).length === 0 : products.length === 0) && newlyAddedDraftProducts.length === 0 && !isEditing && !localError && !(isEditCooldownActive && globalCooldownError) ? ( 
                  <p className="text-gray-500 text-center py-4"> {isEditing ? "No existing products to edit. Add some!" : "No products found."} </p>
                ) : (
                  <>
                    { (paginatedProductsToDisplay.length > 0 || newlyAddedDraftProducts.length > 0 || isEditing) && (
                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-200 sticky top-0 bg-white z-[5]">
                        <div className="font-medium text-gray-500 text-xs md:text-sm">Name</div>
                        <div className="font-medium text-gray-500 text-xs md:text-sm text-right -mr-3">Price</div>
                        {isEditing && <div className="w-6 h-1"></div>}
                      </div>
                    )}
                    <div className="overflow-x-hidden"> 
                      <AnimatePresence mode="wait" custom={paginationDirection}>
                        <motion.div key={currentPage} custom={paginationDirection} variants={pageVariants} initial="initial" animate="enter" exit="exit" className="space-y-1.5 mt-1" >
                          {paginatedProductsToDisplay.map((product, index) => (
                            <motion.div key={product.productid} 
                            layout 
                            custom={index}
                            variants={productItemVariants} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: {duration: 0.2} }} transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-100" >
                              {isEditing ? (
                                <>
                                  <input 
                                    type="text" 
                                    disabled={isEditCooldownActive}
                                    value={product.name} 
                                    onChange={(e) => handleDraftProductChange(product.productid, 'name', e.target.value)} 
                                    className="bg-gray-50 text-black text-xs md:text-sm p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 min-w-0" 
                                    placeholder="Product Name"
                                    maxLength={PRODUCT_NAME_MAX_LENGTH}
                                  />
                                  <input 
                                    type="number" 
                                    disabled={isEditCooldownActive}
                                    value={String(product.price).replace(/^0+(?=\d)/, '')} 
                                    onChange={(e) => handleDraftProductChange(product.productid, 'price', e.target.value === '' ? '' : e.target.value)} 
                                    className="bg-gray-50 text-black text-right text-xs md:text-sm w-20 p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                    placeholder="Price" 
                                    step="any" 
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => handleDraftDeleteProduct(product.productid)} disabled={isEditCooldownActive} className="text-red-500 hover:bg-red-100 h-7 w-7 p-1"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg> </Button>
                                </>
                              ) : (
                                <>
                                  <div className="text-gray-700 text-xs md:text-sm truncate" title={product.name}>{product.name}</div>
                                  <div className="-mr-8 text-gray-700 font-medium text-xs md:text-sm text-right whitespace-nowrap"> {typeof product.price === 'number' ? `₱${product.price.toFixed(2)}` : (product.price || "N/A")} </div>
                                   <div className="w-6 h-1"></div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    {isEditing && newlyAddedDraftProducts.length > 0 && (
                       <div className="mt-3 pt-2 border-t border-dashed border-gray-300">
                         <h3 className="text-xs text-gray-500 mb-1.5 px-1">New Products (Draft)</h3>
                         <div className="space-y-1.5">
                           {newlyAddedDraftProducts.map((product) => (
                              <motion.div key={product.productid} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 md:gap-x-3 py-1.5 border-b border-gray-100" >
                              <input 
                                type="text" 
                                disabled={isEditCooldownActive}
                                value={product.name} 
                                onChange={(e) => handleDraftProductChange(product.productid, 'name', e.target.value)} 
                                className="bg-gray-50 text-black text-xs md:text-sm p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 min-w-0" 
                                placeholder="Product Name" 
                                maxLength={PRODUCT_NAME_MAX_LENGTH}
                              />
                              <input 
                                type="number" 
                                disabled={isEditCooldownActive}
                                value={String(product.price).replace(/^0+(?=\d)/, '')} 
                                onChange={(e) => handleDraftProductChange(product.productid, 'price', e.target.value === '' ? '' : e.target.value)} 
                                className="bg-gray-50 text-black text-right text-xs md:text-sm w-20 p-1.5 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-0.5" 
                                placeholder="Price" 
                                step="any"
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleDraftDeleteProduct(product.productid)} disabled={isEditCooldownActive} className="text-red-500 hover:bg-red-100 h-7 w-7 p-1"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg> </Button>
                            </motion.div>
                           ))}
                         </div>
                       </div>
                     )}
                    {isEditing && currentUser !== "User" && (
                      <Button variant="outline" size="sm" onClick={handleDraftAddProduct} disabled={isEditCooldownActive} className="w-full mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3 mr-1.5" fill="currentColor"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0-32-14.3-32-32s-14.3-32-32-32H256V80z"/></svg> Add Product </Button>
                    )}
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 px-2 py-1.5 md:py-2">
                <div className="flex justify-between items-center w-full">
                  <Button ref={prevButtonRef} variant="ghost" size="sm" onClick={handlePrevPage} disabled={isEditCooldownActive || currentPage === 1 || (isEditing ? draftProducts.filter(p=>!p._isDeleted && !p._isNew).length === 0 && newlyAddedDraftProducts.length === 0 : products.length === 0) } className="text-emerald-700 disabled:text-gray-400 hover:bg-emerald-100 hover:text-emerald-800 px-1 sm:px-2" > <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> <span className="ml-1 hidden sm:inline text-xs">Prev</span> </Button>
                  <div className="flex-grow flex justify-center items-center space-x-1 sm:space-x-2 px-1">
                    {currentUser !== "User" && (isEditing ? (
                      <> <Button size="sm" onClick={saveEdit} disabled={isEditCooldownActive || isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3"> {isSaving ? "Saving..." : "Save"} </Button> <Button variant="outline" size="sm" onClick={cancelEdit} disabled={isSaving} className="border-gray-300 text-gray-600 hover:bg-gray-100 text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3">Cancel</Button> </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleEdit}
                        disabled={isEditCooldownActive}
                        className={`text-gray-600 hover:bg-gray-100 hover:text-black text-[10px] md:text-xs h-7 md:h-8 px-2 sm:px-3 ${isEditCooldownActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      > 
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="sm:mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg> 
                        <span className="hidden sm:inline">Edit Products</span>
                        {isEditCooldownActive && <span className="ml-1 text-xs text-red-500">({getGlobalCooldownRemainingTime()})</span>}
                      </Button>
                    ))}
                  </div>
                  <Button ref={nextButtonRef} variant="ghost" size="sm" onClick={handleNextPage} disabled={isEditCooldownActive || currentPage === totalPages || totalPages <= 1 || (isEditing ? draftProducts.filter(p=>!p._isDeleted && !p._isNew).length === 0 && newlyAddedDraftProducts.length === 0 : products.length === 0)} className="text-emerald-700 disabled:text-gray-400 hover:bg-emerald-100 hover:text-emerald-800 px-1 sm:px-2" > <span className="mr-1 hidden sm:inline text-xs">Next</span> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoreCard;