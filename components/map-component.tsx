"use client";

import React, { useState, useEffect, useRef } from 'react';
import { rectangleData as originalRectangleData, getTooltipPosition, fetchStores } from '@/components/assets/background-images/map';
import MapRectangle from './map-rectangle';
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import StoreComponent from './store-component';
import StoreStatusCard from './ui/store-status-card';
import VisitaPlaceholder from './visita-placeholder';
import { useMapSearch } from '@/components/map-search-context';

const mapComponent = () => {
  const [scale, setScale] = useState(1);
  const [selectedRectangle, setSelectedRectangle] = useState<string | null>(null);
  const containerRef = useRef(null);
  const originalWidth = 2560;
  const originalHeight = 1440;
  const headerHeight = 60;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [storeStatusMap, setStoreStatusMap] = useState<Record<string, boolean>>({});
  const [rectangleData, setRectangleData] = useState(originalRectangleData);
  const supabase = createClient();
  const { 
    selectedStoreId, 
    setSelectedStoreId, 
    storeName, 
    setStoreName, 
    isOpen, 
    setIsOpen,
    selectedProductName
  } = useMapSearch();

  // Add state for realtime subscription
  const [subscription, setSubscription] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
  
      const container = containerRef.current as HTMLDivElement;
      const availableHeight = window.innerHeight - headerHeight;
      const availableWidth = container.offsetWidth;
      
      const widthScale = availableWidth / originalWidth;
      const heightScale = availableHeight / originalHeight;
      
      setScale(Math.min(widthScale, heightScale) * 1.08);
    };
  
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    // First load all stores
    const loadAllStores = async () => {
      try {
        const { storeData, storeStatusMap } = await fetchStores();
        setStoreStatusMap(storeStatusMap);
        updateRectanglesBasedOnStoreStatus(storeStatusMap);
        setLoading(false);
      } catch (error) {
        console.error('Error loading stores:', error);
        setError('Failed to load stores');
        setLoading(false);
      }
    };
    loadAllStores();

    // Set up realtime subscription to storestatus table
    const storeStatusChannel = supabase.channel('store-status-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (insert, update, delete)
        schema: 'public',
        table: 'storestatus',
      },
      async (payload) => {
        console.log('Realtime update received:', payload);
        
        // More efficient approach: only update the specific store that changed
        if (payload.new && 'storeid' in payload.new) {
          const storeId = payload.new.storeid;
          const isStoreOpen = payload.new.status === true;
          
          // Update the store status map for just this store
          setStoreStatusMap(prev => ({
            ...prev,
            [storeId]: isStoreOpen
          }));
          
          // Update just this rectangle
          setRectangleData(prevRectangles => 
            prevRectangles.map(rect => {
              if (rect.id === storeId) {
                return {
                  ...rect,
                  iconColor: !isStoreOpen ? 'red' : originalRectangleData.find(r => r.id === storeId)?.iconColor || rect.iconColor,
                  style: !isStoreOpen ? {
                    ...rect.style,
                    background: '#f07474'
                  } : originalRectangleData.find(r => r.id === storeId)?.style || rect.style
                };
              }
              return rect;
            })
          );
          
          // If the currently selected store was updated, update its details
          if (selectedRectangle && storeId === selectedRectangle) {
            setIsOpen(isStoreOpen);
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('Realtime store subscription status:', status);
    });
    setSubscription(storeStatusChannel);

    // Clean up subscription when component unmounts
    return () => {
      if (storeStatusChannel) {
        supabase.removeChannel(storeStatusChannel);
      } 
    };
  }, [selectedRectangle]);

  // Helper function to update rectangles based on store status
  const updateRectanglesBasedOnStoreStatus = (statusMap: Record<string, boolean>) => {
    const updatedRectangles = originalRectangleData.map(rect => {
      // Check if this rectangle corresponds to a store and if that store is closed
      const isClosed = statusMap[rect.id] === false;
      
      return {
        ...rect,
        iconColor: isClosed ? 'red' : rect.iconColor,
        // Update the style if the store is closed to have a black background
        style: isClosed ? {
          ...rect.style,
          background: '#f07474'
        } : rect.style
      };
    });
    
    setRectangleData(updatedRectangles);
  };

  // Fetch specific store data when a store is selected
  const fetchStoreData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Joined the tables and selected everything from both tables
      const { data: store, error } = await supabase.from('store').select(`*, storestatus:storestatus(*)`).eq('storeid', id);

      const fetchedStoreData = store ? store[0] : null;
      
      if (fetchedStoreData) {
        setStoreName(fetchedStoreData.name);
        setIsOpen(fetchedStoreData.storestatus.status === true);
        setStoreData(fetchedStoreData);
        
        // Update the store status map
        setStoreStatusMap(prev => ({
          ...prev,
          [id]: fetchedStoreData.storestatus.status === true
        }));
      } else {
        setStoreName('No Data');
        setIsOpen(false);
        setStoreData(null);
      }
    } catch (error) {
      setError('Failed to load store');
      console.error('Error fetching store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRectangleClick = (rectangleId: string) => {
    // Toggle selection - if clicking the same rectangle, deselect it
    const newSelectedRectangle = (selectedRectangle === rectangleId) ? null : rectangleId;
    setSelectedRectangle(newSelectedRectangle);
    
    // Update the context
    if (newSelectedRectangle) {
      setSelectedStoreId(newSelectedRectangle);
      fetchStoreData(newSelectedRectangle);
    } else {
      // Clear selection in context
      setSelectedStoreId(null);
    }

    // If selecting a rectangle, fetch its store data
    if (newSelectedRectangle) {
      fetchStoreData(newSelectedRectangle);
    }
    
    console.log(`Rectangle ${rectangleId} ${(selectedRectangle === rectangleId) ? 'deselected' : 'selected'}`);
  };

  // Handle store selection/deselection from StoreComponent
  const handleStoreSelect = (storeId: string | null) => {
    setSelectedRectangle(storeId);
    if (storeId) {
      fetchStoreData(storeId);
    }
    console.log(`Store selection changed to: ${storeId}`);
  };
  
  useEffect(() => {
    // Listen for the custom event from search-bar
    const handleStoreSelectedEvent = (event: CustomEvent) => {
      const { storeId } = event.detail;
      // Set the selected rectangle and fetch store data
      setSelectedRectangle(storeId);
      fetchStoreData(storeId);
    };

    // Add event listener
    window.addEventListener('storeSelected', handleStoreSelectedEvent as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('storeSelected', handleStoreSelectedEvent as EventListener);
    };
  }, []);

  // Add a useEffect to handle selectedStoreId changes from context
  useEffect(() => {
    if (selectedStoreId && selectedStoreId !== selectedRectangle) {
      setSelectedRectangle(selectedStoreId);
      fetchStoreData(selectedStoreId);
    } else if (!selectedStoreId && selectedRectangle) {
      // If selectedStoreId is cleared, also clear the selectedRectangle
      setSelectedRectangle(null);
    }
  }, [selectedStoreId]);

  return (
    <div
      ref={containerRef}
      className='flex justify-center size-full'
    >
      <div
        style={{
          transform: `scale(${scale})`,
        }}
      >
        {/* AnimatePresence to handle both components */}
        <AnimatePresence>
          {selectedStoreId ? (
            /* Store Component */
            <motion.div
              key="store-component"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StoreComponent 
                storeId={selectedStoreId}
                isSelected={true}
                storeName={storeName || ""}
              />
            </motion.div>
          ) : (
            /* Placeholder  */
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, transformOrigin: "top" }}
              animate={{ opacity: 1}}
              exit={{ opacity: 0, scaleY: 1 }}
              transition={{
                opacity: { duration: 0.3, ease: "easeIn" },
                scaleY: { duration: 0.5, ease: "easeIn" }
              }}
            >
              <VisitaPlaceholder />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store Status Card - with delayed appearance */}
        {selectedStoreId && (
          <motion.div 
            className="store-status-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              delay: 0.5,
              duration: 0.3 
            }}
          >
            <StoreStatusCard isOpen={isOpen || false} />
          </motion.div>
        )}

        {/* Map rectangles */}
        {rectangleData.map(rect => (
          <MapRectangle
            key={rect.id}
            id={rect.id}
            style={rect.style}
            title={rect.title}
            isClickable={rect.isClickable}
            icon={rect.icon}
            iconColor={rect.iconColor}
            isSelected={selectedRectangle === rect.id}
            getTooltipPosition={getTooltipPosition}
            onClick={handleRectangleClick}
          />
        ))}
      </div>
    </div>
  );
}

export default mapComponent;