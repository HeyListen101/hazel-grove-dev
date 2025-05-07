"use client";

import React, { useState, useEffect, useRef } from 'react';
// Clean these functions up, they're obselete if we can just transfer them in here
import { rectangleData as originalRectangleData, fetchStores } from '@/components/assets/background-images/map';
import { createClient } from "@/utils/supabase/client";
import StoreComponent from './store-component';
import VisitaPlaceholder from './visita-placeholder';
import { useMapSearch } from '@/components/map-search-context';
import MapBlock from './map-block';
import { mapIconData, color } from '@/components/assets/background-images/icons';
import { getSupabaseAuth } from "@/utils/supabase/auth-singleton";

export default function MapComponent() {
  const supabaseAuth = getSupabaseAuth();
  const [selectedRectangle, setSelectedRectangle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [storeStatusMap, setStoreStatusMap] = useState<Record<string, boolean>>({});
  const [rectangleData, setRectangleData] = useState(originalRectangleData);
  const [currentUser, setCurrentUser] = useState<string>("User");
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


  // Add state for realtime subscription
  const [subscription, setSubscription] = useState<ReturnType<typeof supabase.channel> | null>(null);

  // Set up realtime subscription
  useEffect(() => {
    // First load all stores
    const loadAllStores = async () => {
      try {
        const { storeData, storeStatusMap } = await fetchStores();
        setStoreStatusMap(storeStatusMap);
        // updateRectanglesBasedOnStoreStatus(storeStatusMap);
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

  // Fetch specific store data when a store is selected
  const fetchStoreData = async (storeId: string) => {
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
      console.error('Error fetching store:', error);
      
      // Set fallback values in case of error
      setStoreName('Error Loading Data');
      setIsOpen(false);
      setStoreData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for the custom event from search-bar
    const handleStoreSelectedEvent = (event: CustomEvent) => {
      const { storeId } = event.detail;
      // Set the selected rectangle and fetch store data
      setSelectedRectangle(storeId);
      // Commented this function call since it causes multiple fetch store data calls upon clicking a store
      //fetchStoreData(storeId);
    };

    // Add event listener
    window.addEventListener('storeSelected', handleStoreSelectedEvent as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('storeSelected', handleStoreSelectedEvent as EventListener);
    };
  }, []);

  // Add a useEffect to handle selectedStoreId changes from context
  //useEffect(() => {
  //  if (selectedStoreId && selectedStoreId !== selectedRectangle) {
  //    setSelectedRectangle(selectedStoreId);
  //    fetchStoreData(selectedStoreId);
  //  } else if (!selectedStoreId && selectedRectangle) {
  //    // If selectedStoreId is cleared, also clear the selectedRectangle
  //    setSelectedRectangle(null);
  //  }
  //}, [selectedStoreId]);

  const handleMapBlockClick = (storeId: string) => {
    // Toggle selection - if clicking the same store, deselect it
    const newSelectedStoreId = (selectedStoreId === storeId) ? null : storeId;
    setSelectedStoreId(newSelectedStoreId);
    
    // Update the context
    // If selecting a store, fetch its data
    if (newSelectedStoreId) {
      setSelectedStoreId(newSelectedStoreId);
      fetchStoreData(newSelectedStoreId);
    } else {
      // Clear selection in context
      setSelectedStoreId(null);
    }
    console.log(`Store ${storeId} ${(selectedStoreId === storeId) ? 'deselected' : 'selected'}`);
  };

  return (
    // #13783e #F07474
    <main className="touch-auto bg-white flex items-center justify-center overflow-hidden fixed top-16 inset-x-0 bottom-0">
      <div 
        className="w-[950px] h-[540px] grid place-items-center gap-[2px]"
        style={{
          gridTemplateRows: "repeat(20, 1fr)",
          gridTemplateColumns: "repeat(40, 1fr)",
        }}
      >
        {/* Top-Left Stores */}
        <MapBlock rowStart={1} rowEnd={2} colStart={2} colEnd={4} color={color.a} viewBox={mapIconData[0].viewBox} icon={mapIconData[0].icon} storeId='64bf8920-746d-4441-b14b-0ae92dab286d' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={4} colEnd={6} color={color.b} viewBox={mapIconData[1].viewBox} icon={mapIconData[1].icon} storeId='a75bb856-f9e8-49f7-a19c-7930ba190bd5' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={6} colEnd={8} color={color.c} viewBox={mapIconData[2].viewBox} icon={mapIconData[2].icon} storeId='d589a987-a8a1-4c0a-8d05-f5cc6a7f7a1c' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={8} colEnd={10} color={color.d} viewBox={mapIconData[3].viewBox} icon={mapIconData[3].icon} storeId='5e6e07cf-6cc5-457a-81fa-bbb40f4adb51' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={10} colEnd={11} color={color.e} viewBox={mapIconData[4].viewBox} icon={mapIconData[4].icon} storeId='d266653a-9bb9-4667-972f-14cb2cb12ea8' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={11} colEnd={12} color={color.a} viewBox={mapIconData[5].viewBox} icon={mapIconData[5].icon} storeId='2528f9d5-10c3-4e43-88b1-146ae2c1ae10' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={12} colEnd={15} color={color.b} viewBox={mapIconData[6].viewBox} icon={mapIconData[6].icon} storeId='7456ec64-52c4-4795-898a-9ff8d3215fec' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={15} colEnd={17} color={color.c} viewBox={mapIconData[7].viewBox} icon={mapIconData[7].icon} storeId='d972e9f4-ddfc-4f8d-a42e-de89d2b4f1da' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={3} rowEnd={5} colStart={1} colEnd={2} color={color.d} viewBox={mapIconData[8].viewBox} icon={mapIconData[8].icon} storeId='ea40e428-c8dd-4cba-a155-3a7d5daa8ba1' clickBlock={handleMapBlockClick}/>

        {/* Top-Right Stores */}
        <MapBlock rowStart={1} rowEnd={2} colStart={20} colEnd={21} color={color.a} viewBox={mapIconData[9].viewBox} icon={mapIconData[9].icon} storeId='bf89e6c9-85f6-40f6-a8b4-ae68cf41b01f' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={21} colEnd={22} color={color.b} viewBox={mapIconData[10].viewBox} icon={mapIconData[10].icon} storeId='7a8fdd07-7b85-41a5-9188-fe36495fa306' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={22} colEnd={23} color={color.c} viewBox={mapIconData[11].viewBox} icon={mapIconData[11].icon} storeId='23b57a8b-5f63-4372-9e16-7634e8f43441' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={23} colEnd={24} color={color.d} viewBox={mapIconData[12].viewBox} icon={mapIconData[12].icon} storeId='14af284c-89d2-4206-8bd1-9ea009b630e3' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={24} colEnd={25} color={color.e} viewBox={mapIconData[13].viewBox} icon={mapIconData[13].icon} storeId='0d9b534c-4dc5-4e2c-9af3-b0ca52bdf409' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={25} colEnd={26} color={color.a} viewBox={mapIconData[14].viewBox} icon={mapIconData[14].icon} storeId='51766da5-fb72-4fef-a96e-a7f6ed3d239b' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={26} colEnd={27} color={color.b} viewBox={mapIconData[15].viewBox} icon={mapIconData[15].icon} storeId='81b862f5-4da3-4881-8def-bafe0ac6e283' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={27} colEnd={28} color={color.c} viewBox={mapIconData[16].viewBox} icon={mapIconData[16].icon} storeId='acb061a3-6e4a-43ce-990d-9237c0e1b314' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={28} colEnd={29} color={color.d} viewBox={mapIconData[17].viewBox} icon={mapIconData[17].icon} storeId='86c36c61-ecdc-4fea-a7af-168e3a9cb41d' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={29} colEnd={30} color={color.e} viewBox={mapIconData[18].viewBox} icon={mapIconData[18].icon} storeId='49c0f9c0-da7a-4732-8a9f-415ecb8f36df' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={30} colEnd={31} color={color.a} viewBox={mapIconData[19].viewBox} icon={mapIconData[19].icon} storeId='ab00d975-ea9a-48f9-91ca-6a45a9218233' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={31} colEnd={32} color={color.b} viewBox={mapIconData[20].viewBox} icon={mapIconData[20].icon} storeId='bdd1a932-4a64-43a4-9282-a3393fd0eb77' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={32} colEnd={33} color={color.c} viewBox={mapIconData[21].viewBox} icon={mapIconData[21].icon} storeId='8d48db72-cf13-487f-855d-9840bace55df' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={33} colEnd={34} color={color.d} viewBox={mapIconData[22].viewBox} icon={mapIconData[22].icon} storeId='767d6761-2b63-4f75-91ef-2a7c32271b83' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={34} colEnd={35} color={color.e} viewBox={mapIconData[23].viewBox} icon={mapIconData[23].icon} storeId='7a1c2004-d951-4ecc-9e0c-a08b7d7eeae0' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={35} colEnd={36} color={color.a} viewBox={mapIconData[24].viewBox} icon={mapIconData[24].icon} storeId='405d1a0f-b620-426a-a8db-80428a2c60f9' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={2} colStart={36} colEnd={37} color={color.b} viewBox={mapIconData[25].viewBox} icon={mapIconData[25].icon} storeId='e859ab86-eaf9-4cbc-9dca-14f389fee755' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={1} rowEnd={3} colStart={37} colEnd={41} color={color.c} viewBox={mapIconData[26].viewBox} icon={mapIconData[26].icon} storeId='a4bf315c-be4d-4066-929e-7f18810f529c' clickBlock={handleMapBlockClick}/>

        {/* Roads and Walkways */}
        <MapBlock rowStart={3} rowEnd={4} colStart={4} colEnd={19} height={30} color={color.f}/>
        <MapBlock rowStart={3} rowEnd={5} colStart={18} colEnd={38} height={50} color={color.f}/>
        <MapBlock rowStart={1} rowEnd={22} colStart={18} colEnd={19} color={color.f}/>
        <MapBlock rowStart={4} rowEnd={22} colStart={37} colEnd={38} color={color.f}/>
        <MapBlock rowStart={5} rowEnd={21} colStart={24} colEnd={25} width={30} color={color.f}/>
        <MapBlock rowStart={13} rowEnd={21} colStart={33} colEnd={34} width={30} color={color.f}/>
        <MapBlock rowStart={13} rowEnd={18} colStart={36} colEnd={37} width={30} color={color.f}/>
        <MapBlock rowStart={17} rowEnd={18} colStart={24} colEnd={37} height={30} color={color.f}/>
        <MapBlock rowStart={20} rowEnd={21} colStart={24} colEnd={34} height={30} color={color.f}/>

        {/* Rightmost Stores */} 
        <MapBlock rowStart={4} rowEnd={5} colStart={39} colEnd={41} color={color.d} viewBox={mapIconData[27].viewBox} icon={mapIconData[27].icon} storeId='3edc0d84-dd1c-4195-836d-e22df3a9571e' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={5} rowEnd={6} colStart={39} colEnd={41} color={color.e} viewBox={mapIconData[28].viewBox} icon={mapIconData[28].icon} storeId='57e7b9e8-74ac-4695-b924-09041fd2278c' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={6} rowEnd={7} colStart={39} colEnd={41} color={color.a} viewBox={mapIconData[29].viewBox} icon={mapIconData[29].icon} storeId='bf83ff80-4b94-4731-b4dd-145dd0c90224' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={7} rowEnd={8} colStart={39} colEnd={41} color={color.b} viewBox={mapIconData[30].viewBox} icon={mapIconData[30].icon} storeId='e349cc93-66a8-4ab0-9555-8c9d4585f837' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={8} rowEnd={9} colStart={39} colEnd={41} color={color.c} viewBox={mapIconData[31].viewBox} icon={mapIconData[31].icon} storeId='7076ad11-e371-48fd-bccd-46161c57e6d2' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={9} rowEnd={10} colStart={39} colEnd={41} color={color.d} viewBox={mapIconData[32].viewBox} icon={mapIconData[32].icon} storeId='23636531-3c91-4204-8172-74111cc10046' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={10} rowEnd={11} colStart={39} colEnd={41} color={color.e} viewBox={mapIconData[33].viewBox} icon={mapIconData[33].icon} storeId='05b9ebf4-0216-4099-9939-4861f6f11069' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={11} rowEnd={12} colStart={39} colEnd={41} color={color.a} viewBox={mapIconData[34].viewBox} icon={mapIconData[34].icon} storeId='e3556f67-2766-4356-ba54-d5c74434a056' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={13} rowEnd={14} colStart={39} colEnd={41} color={color.b} viewBox={mapIconData[35].viewBox} icon={mapIconData[35].icon} storeId='02c63a3c-31b6-4421-8e92-b8ee97a0285b' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={14} rowEnd={15} colStart={39} colEnd={41} color={color.c} viewBox={mapIconData[36].viewBox} icon={mapIconData[36].icon} storeId='63541b29-1b79-4986-883f-052771349ebb' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={15} rowEnd={16} colStart={39} colEnd={41} color={color.d} viewBox={mapIconData[37].viewBox} icon={mapIconData[37].icon} storeId='e7918daa-4a7f-439c-9ece-48e843be2c95' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={16} rowEnd={17} colStart={39} colEnd={41} color={color.e} viewBox={mapIconData[38].viewBox} icon={mapIconData[38].icon} storeId='84230fec-fda9-4a45-9b6e-f8dc4e4a508a' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={17} rowEnd={18} colStart={39} colEnd={41} color={color.a} viewBox={mapIconData[39].viewBox} icon={mapIconData[39].icon} storeId='92b4c136-6ba8-4d3d-854d-6105a31115a4' clickBlock={handleMapBlockClick}/>

        {/* Bottom Stores */}
        <MapBlock rowStart={18} rowEnd={19} colStart={25} colEnd={27} color={color.b} viewBox={mapIconData[40].viewBox} icon={mapIconData[40].icon} storeId="5453baa1-ac44-4aab-953c-41566080f12d" clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={18} rowEnd={19} colStart={27} colEnd={28} color={color.c} viewBox={mapIconData[41].viewBox} icon={mapIconData[41].icon} storeId='13fd517d-0f7a-4dad-b21b-058df1b8a708' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={18} rowEnd={19} colStart={28} colEnd={29} color={color.d} viewBox={mapIconData[42].viewBox} icon={mapIconData[42].icon} storeId='cea9dd2f-67bd-458b-bb58-dfaf4d52add8' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={18} rowEnd={19} colStart={29} colEnd={30} color={color.e} viewBox={mapIconData[43].viewBox} icon={mapIconData[43].icon} storeId='e3bf2e95-2655-4ad7-b3f8-6835fcae0c21' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={18} rowEnd={19} colStart={30} colEnd={31} color={color.a} viewBox={mapIconData[44].viewBox} icon={mapIconData[44].icon} storeId='e612b43e-9b86-42ec-a641-a2deca15f8c0' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={18} rowEnd={19} colStart={31} colEnd={33} color={color.b} viewBox={mapIconData[45].viewBox} icon={mapIconData[45].icon} storeId='378c68a5-8854-41f8-99ac-dc23298bb988' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={25} colEnd={27} color={color.c} viewBox={mapIconData[46].viewBox} icon={mapIconData[46].icon} storeId='ed64621f-b622-4ebf-8676-7433db010a28' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={27} colEnd={28} color={color.d} viewBox={mapIconData[47].viewBox} icon={mapIconData[47].icon} storeId='dd183dc4-3b40-4b5e-a6de-6580062f926e' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={28} colEnd={29} color={color.e} viewBox={mapIconData[48].viewBox} icon={mapIconData[48].icon} storeId='0ec5837b-5b59-4e56-a673-6b98105e89db' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={29} colEnd={30} color={color.a} viewBox={mapIconData[49].viewBox} icon={mapIconData[49].icon} storeId='99337afb-2ec2-4cb4-995b-fcf40b2bb6b1' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={30} colEnd={31} color={color.b} viewBox={mapIconData[50].viewBox} icon={mapIconData[50].icon} storeId='3c896041-6c47-41a5-9f05-3d46a581a91e' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={31} colEnd={32} color={color.c} viewBox={mapIconData[51].viewBox} icon={mapIconData[51].icon} storeId='2cc9f21d-38bc-4064-a1df-321508b4449c' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={19} rowEnd={20} colStart={32} colEnd={33} color={color.d} viewBox={mapIconData[52].viewBox} icon={mapIconData[52].icon} storeId='b370821e-baa7-4f50-93c8-8fa56aee6ecc' clickBlock={handleMapBlockClick}/>

        {/* Central Places */}
        <MapBlock rowStart={5} rowEnd={18} colStart={20} colEnd={24} color={color.d} viewBox={mapIconData[53].viewBox} icon={mapIconData[53].icon} storeId='558a8735-1a1e-4672-a1f2-50c1793d3035' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={7} rowEnd={17} colStart={25} colEnd={33} color={color.e} viewBox={mapIconData[54].viewBox} icon={mapIconData[54].icon} />
        <MapBlock rowStart={13} rowEnd={15} colStart={34} colEnd={36} color={color.c} viewBox={mapIconData[55].viewBox} icon={mapIconData[55].icon} storeId='8cf59478-c5fb-426d-afd3-29b724866021' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={15} rowEnd={17} colStart={34} colEnd={35} color={color.b} viewBox={mapIconData[56].viewBox} icon={mapIconData[56].icon} storeId='68769d27-1592-451c-a2e1-5c29947fe57d' clickBlock={handleMapBlockClick}/>
        <MapBlock rowStart={15} rowEnd={17} colStart={35} colEnd={36} color={color.a} viewBox={mapIconData[57].viewBox} icon={mapIconData[57].icon} storeId='5ad7a95c-5765-4f4a-bd19-d65c09fa6a0f' clickBlock={handleMapBlockClick}/>
        
        {selectedStoreId ? (
          <div 
            className="rounded-[15px] h-full w-full"
            style={{
              gridRowStart: 5,
              gridRowEnd: 20,
              gridColumnStart: 5,
              gridColumnEnd: 16,
            }}
          >
            <StoreComponent 
              storeId={selectedStoreId}
              isSelected={!!selectedStoreId}
              storeName={storeName || ''}
            />
          </div>
        ) : (
          <VisitaPlaceholder/>
        )}
      </div>
    </main>
  )
}