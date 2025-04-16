"use client";

import React, { useState, useEffect, useRef } from 'react';
import { rectangleData as originalRectangleData, getTooltipPosition, fetchStores } from '@/components/assets/background-images/map';
import MapRectangle from './map-rectangle';
import StoreComponent from './store-component';
import { createClient } from "@/utils/supabase/client";

const Rectangles = () => {
  const [scale, setScale] = useState(1);
  const [selectedRectangle, setSelectedRectangle] = useState<string | null>(null);
  const containerRef = useRef(null);
  const originalWidth = 2560;
  const originalHeight = 1440;
  const headerHeight = 60;
  
  // Added store-related state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Store');
  const [isOpen, setIsOpen] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [storeStatusMap, setStoreStatusMap] = useState<Record<string, boolean>>({});
  const [rectangleData, setRectangleData] = useState(originalRectangleData);
  const supabase = createClient();

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
  const storeStatusChannel = supabase
    .channel('store-status-changes')
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

      const { data: { session } } = await supabase.auth.getSession();

      // Joined the tables and selected everything from both tables
      const { data: store, error } = await supabase
        .from('store')
        .select(`
          *,
          storestatus:storestatus(*)
        `) 
        .eq('storeid', id);

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
    const newSelectedRectangle = selectedRectangle === rectangleId ? null : rectangleId;
    setSelectedRectangle(newSelectedRectangle);
    
    // If selecting a rectangle, fetch its store data
    if (newSelectedRectangle) {
      fetchStoreData(newSelectedRectangle);
    }
    
    console.log(`Rectangle ${rectangleId} ${selectedRectangle === rectangleId ? 'deselected' : 'selected'}`);
  };

  // Handle store selection/deselection from StoreComponent
  const handleStoreSelect = (storeId: string | null) => {
    setSelectedRectangle(storeId);
    if (storeId) {
      fetchStoreData(storeId);
    }
    console.log(`Store selection changed to: ${storeId}`);
  };
  
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div
        style={{
          position: 'absolute',
          width: `${originalWidth}px`,
          height: `${originalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          left: '50%',
          marginLeft: `-${originalWidth / 2}px`,
          top: '-0.5rem',
        }}
      >
      {/* Store component - always render it but control visibility with props */}
      <StoreComponent 
        storeId={selectedRectangle || ""} 
        isSelected={!!selectedRectangle}
        onStoreSelect={handleStoreSelect}
        storeName={storeName}
        isOpen={isOpen}
      />
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

export default Rectangles;