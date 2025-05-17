"use client";

import { debounce } from 'lodash';
import MapBlock from './map-block';
import MapTooltip from './map-tooltip';
import  Controls from './ui/zoom-controls';
import StoreCard from './ui/store-card';
import VisitaPlaceholder from './visita-placeholder';
import { createClient } from "@/utils/supabase/client";
import React, { useState, useEffect, useRef } from 'react';
import { useMapSearch } from '@/components/map-search-context';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { mapData, colors, svgPathVal } from './assets/background-images/map';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left' | null;

export type Store = {
  storeid: string;
  owner: string;
  storestatus: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
}

export default function MapComponent() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const targetRef = useRef<HTMLDivElement>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("User");
  const [isSelectionLoading, setIsSelectionLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: "70vw", height: "30vw" });
  const [storeStatusMap, setStoreStatusMap] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState<ReturnType<typeof supabase.channel> | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('top');
  const [selectedBlockCoords, setSelectedBlockCoords] = useState<{
    rowStart?: number;
    rowEnd?: number;
    colStart?: number;
    colEnd?: number;
  }>({});
  const { 
    selectedStoreId, 
    setSelectedStoreId, 
    storeName, 
    setStoreName,
    setIsOpen,
    isMapSelectionInProgress,
  } = useMapSearch();

  // useEffect for getting the current user
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

  // Set up realtime subscription
  useEffect(() => {
    // First load all stores
    const loadAllStores = async () => {
      try {
        const { storeData, storeStatusMap } = await fetchStores();
        setStoreStatusMap(storeStatusMap);
        setLoading(false);
      } catch (error) {
        console.log('Error loading stores:', error);
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
        event: '*',
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
          
          // If the currently selected store was updated, update its details
          if (selectedStoreId && storeId === selectedStoreId) {
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
  }, [selectedStoreId]);

  // useEffect for handling custom 'storeSelected' event from search bar
  useEffect(() => {
    const handleStoreSelectedEvent = (event: CustomEvent) => {
      const { storeId: newStoreIdFromEvent } = event.detail;
      console.log("MapComponent: Received 'storeSelected' event for:", newStoreIdFromEvent);
  
      // Check if we're already handling a selection from the map
      // or if the context is currently dispatching an event
      if (isMapSelectionInProgress) {
        console.log("MapComponent: Ignoring event because map selection is in progress");
        return;
      }
  
      // Only update if the ID is different from the current one
      if (newStoreIdFromEvent !== selectedStoreId) {
        // Directly fetch store data without calling setSelectedStoreId again
        fetchStoreData(newStoreIdFromEvent);
        
        // Find the block data to update tooltip coordinates
        const selectedBlock = mapData.find(block => block.storeId === newStoreIdFromEvent);
        if (selectedBlock) {
          setSelectedBlockCoords({
            rowStart: selectedBlock.rowStart,
            rowEnd: selectedBlock.rowEnd,
            colStart: selectedBlock.colStart,
            colEnd: selectedBlock.colEnd
          });
        }
      }
    };
  
    window.addEventListener('storeSelected', handleStoreSelectedEvent as EventListener);
  
    return () => {
      window.removeEventListener('storeSelected', handleStoreSelectedEvent as EventListener);
    };
  }, [selectedStoreId, isMapSelectionInProgress, mapData]);

  // Scroll to the target element when the component mounts
  // useEffect(() => {
  //   targetRef.current?.scrollIntoView({ behavior: 'smooth' }); // or 'auto'
  // }, []);

  // Debounced version of fetchStoreData eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchStoreData = useRef(
    debounce(async (storeId: string) => {
      try {
        setLoading(true);
        setError(null);
    
        // Joined the tables and selected everything from both tables
        const { data: store, error } = await supabase
        .from('store')
        .select(`*, 
                storestatus:storestatus(*)`)
        .eq('storeid', storeId);
    
        let fetchedStoreData = store ? store[0] : null;

        // Create store statuts if null then update the clicked store with that newly created status
        if (fetchedStoreData && !fetchedStoreData.storestatus && currentUser) {
          const { data: statusData, error: insertErr } = await supabase
          .from('storestatus')
          .insert({ contributor: currentUser, status: false })
          .select();
          const statusId = statusData? statusData[0] : null;
          if (statusId) {
            const { error } = await supabase
            .from('store')
            .update({ storestatus: statusId.storestatusid })
            .eq('storeid', fetchedStoreData.storeid);
          }
          const { data: store, error } = await supabase
          .from('store')
          .select(`*, 
                  storestatus:storestatus(*)`)
          .eq('storeid', storeId);

          fetchedStoreData = store ? store[0] : null;
        }
        
        if (fetchedStoreData && fetchedStoreData.storestatus) {
          setStoreName(fetchedStoreData.name || 'No Name');
          setIsOpen(fetchedStoreData.storestatus.status === true);
          setStoreData(fetchedStoreData);
          
          // Update the store status map
          setStoreStatusMap(prev => ({
            ...prev,
            [storeId]: fetchedStoreData.storestatus.status === true
          }));
        } else {
          // Handle the case when fetchedStoreData is null or missing storestatus
          setStoreName('No Data');
          setIsOpen(false);
          setStoreData(null);
          
          // Update the store status map to show as closed
          setStoreStatusMap(prev => ({
            ...prev,
            [storeId]: false
          }));
        }
      } catch (error) {
        setError('Failed to load store');
        console.log('Error fetching store:', error);
        
        // Set fallback values in case of error
        setStoreName('Error Loading Data');
        setIsOpen(false);
        setStoreData(null);
      } finally {
        setLoading(false);
        setIsSelectionLoading(false); // Reset selection loading state
      }
    }, 300) // 300ms debounce time - adjust as needed
  ).current;

  // Function to change the tooltip position
  const handleToolTipPositionChange = (position: TooltipPosition) => {
    if (position === 'top') {
      setTooltipPosition('bottom');
    } else if (position === 'right') {
      setTooltipPosition('left');
    } else if (position === 'bottom') {
      setTooltipPosition('top');
    } else if (position === 'left') {
      setTooltipPosition('right');
    }
  };

  // Fetch all stores and their statuses
  const fetchStores = async (): Promise<{storeData: Store[], storeStatusMap: Record<string, boolean>}> => {
    try {
      // Joined the tables and selected everything from both tables
      const { data: stores, error } = await supabase.from('store').select(`*, storestatus:storestatus(*)`);
  
      if (error) {
        return { storeData: [], storeStatusMap: {} };
      }
  
      // Create a map of store IDs to their status
      const storeStatusMap: Record<string, boolean> = {};
      
      stores?.forEach(store => {
        const isOpen = store.storestatus?.status === true;
        storeStatusMap[store.storeid] = isOpen;
      });
      return { storeData: stores || [], storeStatusMap };
    } catch (error) {
      return { storeData: [], storeStatusMap: {} };
    }
  };

  // Fetch specific store data when a store is selected
  const fetchStoreData = (storeId: string) => {
    setIsSelectionLoading(true); // Set loading state
    debouncedFetchStoreData(storeId);
  };
  
  // Function to handle map block click to prevent rapid clicks
  const handleMapBlockClick = (storeId: string, tooltipPosition?: TooltipPosition) => {
    // Prevent action if already loading
    if (isSelectionLoading) {
      return;
    }
    
    // Toggle selection - if clicking the same store, deselect it
    const newSelectedStoreId = (selectedStoreId === storeId) ? null : storeId;
    
    // Update the context
    // If selecting a store, fetch its data
    if (newSelectedStoreId) {
      setSelectedStoreId(newSelectedStoreId);
      fetchStoreData(newSelectedStoreId);
      
      // Find the block data from mapData that matches this storeId
      const selectedBlock = mapData.find(block => block.storeId === storeId);
      
      if (selectedBlock) {
        // Update selectedBlockCoords with the block's coordinates
        setSelectedBlockCoords({
          rowStart: selectedBlock.rowStart,
          rowEnd: selectedBlock.rowEnd,
          colStart: selectedBlock.colStart,
          colEnd: selectedBlock.colEnd
        });
      }
      
      // Update tooltip position if provided
      if (tooltipPosition) {
        handleToolTipPositionChange(tooltipPosition);
      }
    } else {
      // Clear selection in context
      setSelectedStoreId(null);
      // Clear selected block coordinates
      setSelectedBlockCoords({});
    }
    console.log(`Store ${storeId} ${(selectedStoreId === storeId) ? 'deselected' : 'selected'}`);
  };

  return (
    // #13783e #F07474
    <TransformWrapper
    initialScale={1}
    limitToBounds={true}
    centerOnInit={true}
    >
      <main className="bg-white flex flex-col items-center justify-center overflow-hidden absolute top-0 inset-x-0 bottom-0">
        <TransformComponent contentStyle={{width: '95vw', height: '50vw' }}>
          <div
            className="w-full grid place-items-center gap-[2px] relative"
            style={{
              gridTemplateRows: "repeat(20, 1fr)",
              gridTemplateColumns: "repeat(40, 1fr)",
            }}
          >
            {/* Roads and Walkways */}
            <MapBlock rowStart={1} rowEnd={22} colStart={18} colEnd={19} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={3} rowEnd={4} colStart={4} colEnd={19} height={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={3} rowEnd={5} colStart={18} colEnd={38} height={50} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={4} rowEnd={22} colStart={37} colEnd={38} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={5} rowEnd={21} colStart={24} colEnd={25} width={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={13} rowEnd={21} colStart={33} colEnd={34} width={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={13} rowEnd={18} colStart={36} colEnd={37} width={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={17} rowEnd={18} colStart={24} colEnd={37} height={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={20} rowEnd={21} colStart={24} colEnd={34} height={30} defaultColor={colors.f} pointerEvents={false}/>
            <MapBlock rowStart={7} rowEnd={17} colStart={25} colEnd={33} defaultColor={colors.e} icon={svgPathVal.park} pointerEvents={false}/>
            {/* Map all store blocks from mapData */}
            {mapData.map((block, index) => (
              <MapBlock
                // id={block.storeId} // add this if you want to debug
                key={index}
                storeId={block.storeId || ''}
                rowStart={block.rowStart}
                rowEnd={block.rowEnd}
                colStart={block.colStart}
                colEnd={block.colEnd}
                defaultColor={block.defaultColor}
                icon={block.icon}
                viewBox={block.viewBox}
                clickBlock={handleMapBlockClick}
                tooltipPosition={block.position as TooltipPosition}
              />
            ))}
            {/* Selected Store Tooltip */}
            {selectedStoreId && selectedBlockCoords.rowStart && (
              <MapTooltip
                // id={selectedStoreId} // add this if you want to debug
                name={storeName || "Unknown Store"}
                position={tooltipPosition}
                rowStart={selectedBlockCoords.rowStart}
                rowEnd={selectedBlockCoords.rowEnd}
                colStart={selectedBlockCoords.colStart}
                colEnd={selectedBlockCoords.colEnd}
              />
            )}
            {/* Loading Indicator
            {isSelectionLoading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <LoadingIndicator/>
              </div>
            )} */}
            </div>
          </TransformComponent>
        <Controls/>
      </main>
    </TransformWrapper>
  );
}