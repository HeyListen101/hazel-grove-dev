"use client";

import { createClient } from "@/utils/supabase/client";

interface Store {
  storeid: string;
  owner: string;
  storestatus: string;
  name: string;
  longitude: number;
  latitude: number;
  datecreated: string;
  isarchived: boolean;
} 


interface RectangleData {
  id: string;
  style: React.CSSProperties;
  title: string;
  isClickable: boolean;
  icon?: React.ReactNode;
  iconColor?: string;
}

// Create a mapping between store IDs and rectangle IDs
const storeToRectangleMap: Record<string, string> = {
  "02c63a3c-31b6-4421-8e92-b8ee97a0285b": "rectangle65",
  // Add more mappings as needed
};

// Initialize Supabase client
const supabase = createClient();

// Function to fetch all stores from the database
export const fetchStores = async (): Promise<{storeData: Store[], storeStatusMap: Record<string, boolean>}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('User authenticated:', session);

    // Joined the tables and selected everything from both tables
    const { data: stores, error } = await supabase
      .from('store')
      .select(`
        *,
        storestatus:storestatus(*)
      `);

    if (error) {
      console.error('Error fetching stores:', error);
      return { storeData: [], storeStatusMap: {} };
    }

    // Create a map of store IDs to their status
    const storeStatusMap: Record<string, boolean> = {};
    
    stores?.forEach(store => {
      const isOpen = store.storestatus?.status === true;
      storeStatusMap[store.storeid] = isOpen;
    });

    console.log('Stores fetched:', stores?.length);
    return { storeData: stores || [], storeStatusMap };
  } catch (error) {
    console.error('Error in fetchStores:', error);
    return { storeData: [], storeStatusMap: {} };
  }
};

export const mapCSS: { [key: string]: React.CSSProperties } = {
    rectangle69: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '913px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle68: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '975px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle67: {
      position: 'absolute',
      width: '111px',
      height: '63px',
      left: '2399px',
      top: '1037px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle66: {
      position: 'absolute',
      width: '111px',
      height: '64px',
      left: '2399px',
      top: '849px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle65: {
      position: 'absolute',
      width: '111px',
      height: '62px',
      left: '2399px',
      top: '787px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle64: {
      position: 'absolute',
      width: '111px',
      height: '54px',
      left: '2399px',
      top: '663px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle63: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '612px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle62: {
      position: 'absolute',
      width: '111px',
      height: '53px',
      left: '2399px',
      top: '559px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle61: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '508px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle60: {
      position: 'absolute',
      width: '111px',
      height: '52px',
      left: '2399px',
      top: '456px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle59: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '405px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle58: {
      position: 'absolute',
      width: '111px',
      height: '54px',
      left: '2399px',
      top: '351px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle57: {
      position: 'absolute',
      width: '111px',
      height: '51px',
      left: '2399px',
      top: '300px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle56: {
      position: 'absolute',
      width: '67px',
      height: '51px',
      left: '2043px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle55: {
      position: 'absolute',
      width: '66px',
      height: '51px',
      left: '2110px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle54: {
      position: 'absolute',
      width: '68px',
      height: '51px',
      left: '1975px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle53: {
      position: 'absolute',
      width: '68px',
      height: '51px',
      left: '1907px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle52: {
      position: 'absolute',
      width: '66px',
      height: '51px',
      left: '1841px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle51: {
      position: 'absolute',
      width: '58px',
      height: '105px',
      left: '1556px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle50: {
    position: 'absolute',
    width: '213px',
    height: '640px',
    left: '1170px',
    top: '439px',
    background: '#13783e',
    border: '1px solid #FFFFFF',
    borderRadius: '5px',
    boxSizing: 'border-box',
    },
    rectangle49: {
      position: 'absolute',
      width: '169px',
      height: '84px',
      left: '2065px',
      top: '788px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle48: {
      position: 'absolute',
      width: '86px',
      height: '162px',
      left: '2065px',
      top: '871px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle47: {
      position: 'absolute',
      width: '83px',
      height: '162px',
      left: '2150px',
      top: '871px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle46: {
      position: 'absolute',
      width: '565px',
      height: '587px',
      left: '1446px',
      top: '439px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle45: {
      position: 'absolute',
      width: '55px',
      height: '105px',
      left: '1501px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle44: {
      position: 'absolute',
      width: '55px',
      height: '51px',
      left: '1446px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle43: {
      position: 'absolute',
      width: '58px',
      height: '51px',
      left: '1388px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle42: {
      position: 'absolute',
      width: '56px',
      height: '51px',
      left: '1332px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle41: {
      position: 'absolute',
      width: '59px',
      height: '51px',
      left: '1273px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle40: {
      position: 'absolute',
      width: '56px',
      height: '51px',
      left: '1217px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle39: {
      position: 'absolute',
      width: '55px',
      height: '51px',
      left: '1162px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle38: {
      position: 'absolute',
      width: '113px',
      height: '105px',
      left: '942px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle37: {
      position: 'absolute',
      width: '55px',
      height: '1192px',
      left: '1079px',
      top: '179px',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #D6D8D9 5%, #D6D8D9 95%, #FFFFFF 100%)',
    },
    rectangle36: {
      position: 'absolute',
      width: '23px',
      height: '471px',
      left: '2027px',
      top: '787px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
    },
    rectangle35: {
      position: 'absolute',
      width: '24px',
      height: '819px',
      left: '1395px',
      top: '439px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
    },
    rectangle34: {
      position: 'absolute',
      width: '23px',
      height: '278px',
      left: '2246px',
      top: '787px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '25px 25px 0px 0px',
      
    },
    rectangle33: {
      position: 'absolute',
      width: '1212px',
      height: '54px',
      left: '1134px',
      top: '333px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px 18px 0px 0px',
      
    },
    rectangle32: {
      position: 'absolute',
      width: '608px',
      height: '21px',
      left: '1419px',
      top: '1044px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
      
    },
    rectangle31: {
      position: 'absolute',
      width: '196px',
      height: '21px',
      left: '2050px',
      top: '1044px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
      
    },
    rectangle30: {
      position: 'absolute',
      width: '608px',
      height: '22px',
      left: '1419px',
      top: '1236px',
      background: 'rgba(153, 157, 160, 0.4)',
      borderRadius: '0px',
      
    },
    rectangle29: {
      position: 'absolute',
      width: '59px',
      height: '986px',
      left: '2287px',
      top: '385px',
      background: 'linear-gradient(180deg, #D6D8D9 94.51%, #FFFFFF 100%)',
      borderRadius: '0px',
      
    },
    rectangle28: {
      position: 'absolute',
      width: '79px',
      height: '70px',
      left: '1446px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle27: {
      position: 'absolute',
      width: '79px',
      height: '73px',
      left: '1446px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle26: {
      position: 'absolute',
      width: '78px',
      height: '73px',
      left: '1525px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle25: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1603px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle24: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1684px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle23: {
      position: 'absolute',
      width: '76px',
      height: '73px',
      left: '1765px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle22: {
      position: 'absolute',
      width: '80px',
      height: '73px',
      left: '1841px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle21: {
      position: 'absolute',
      width: '81px',
      height: '73px',
      left: '1921px',
      top: '1149px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle20: {
      position: 'absolute',
      width: '78px',
      height: '70px',
      left: '1525px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle19: {
      position: 'absolute',
      width: '81px',
      height: '70px',
      left: '1603px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle18: {
      position: 'absolute',
      width: '76px',
      height: '70px',
      left: '1765px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle17: {
      position: 'absolute',
      width: '161px',
      height: '70px',
      left: '1841px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle16: {
      position: 'absolute',
      width: '81px',
      height: '70px',
      left: '1684px',
      top: '1079px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle15: {
      position: 'absolute',
      width: '185px',
      height: '105px',
      left: '757px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle14: {
      position: 'absolute',
      width: '79px',
      height: '105px',
      left: '678px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle13: {
      position: 'absolute',
      width: '80px',
      height: '105px',
      left: '598px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle12: {
      position: 'absolute',
      width: '115px',
      height: '105px',
      left: '483px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle11: {
      position: 'absolute',
      width: '110px',
      height: '105px',
      left: '373px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle10: {
        position: 'absolute',
        width: '112px',
        height: '105px',
        left: '261px',
        top: '179px',
        background: '#13783e',
        border: '1px solid #FFFFFF',
        borderRadius: '5px',
        boxSizing: 'border-box',
    },
    rectangle9: {
      position: 'absolute',
      width: '113px',
      height: '51px',
      left: '148px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle8: {
      position: 'absolute',
      width: '55px',
      height: '158px',
      left: '50px',
      top: '230px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle7: {
      position: 'absolute',
      width: '57px',
      height: '105px',
      left: '1784px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle6: {
      position: 'absolute',
      width: '56px',
      height: '105px',
      left: '1728px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle5: {
      position: 'absolute',
      width: '56px',
      height: '105px',
      left: '1672px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle4: {
      position: 'absolute',
      width: '58px',
      height: '105px',
      left: '1614px',
      top: '179px',
      background: '#13783e',
      border: '1px solid #FFFFFF',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle3: {
      position: 'absolute',
      width: '250px',
      height: '105px',
      left: '2177px',
      top: '180px',
      background: '#13783e',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    rectangle2: {
      position: 'absolute',
      width: '938px',
      height: '16px',
      left: '141px',
      top: '299px',
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(153, 157, 160, 0.4) 10%)',
      borderRadius: '0px',
      
    },
    // rectangle1: {
    //   position: 'absolute',
    //   width: '709px',
    //   height: '891px',
    //   left: '217px',
    //   top: '406px',
    //   background: 'rgba(0, 0, 0, 0.4)',
    //   borderRadius: '9px',
    // },
  };

const isClickable = (rectangleId: string): boolean => {
  const nonClickableRectangles = [
    'rectangle2',
    'rectangle29',
    'rectangle30',
    'rectangle31',
    'rectangle32',
    'rectangle33',  
    'rectangle34',
    'rectangle35',
    'rectangle36',
    'rectangle37',
  ];

  return !nonClickableRectangles.includes(rectangleId);
};

export const rectangleData: RectangleData[] = [{
  id: 'rectangle69',
  style: mapCSS.rectangle69,
  title: 'Store69',
  isClickable: isClickable('rectangle69'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle68',
  style: mapCSS.rectangle68,
  title: 'Store68',
  isClickable: isClickable('rectangle68'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle67',
  style: mapCSS.rectangle67,
  title: 'Store67',
  isClickable: isClickable('rectangle67'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
          <g fill="currentColor" fillRule="evenodd" clipRule="evenodd" strokeWidth="0.1" stroke="currentColor">
            <path d="M11 3.5H6v-2h5a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H6v-2h5a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3" />
            <path d="M6 1.5a1 1 0 0 1 1 1V18a1 1 0 1 1-2 0V2.5a1 1 0 0 1 1-1" />
            <path d="M2 5.436a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1" />
          </g>
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle66',
  style: mapCSS.rectangle66,
  title: 'Store66',
  isClickable: isClickable('rectangle66'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'02c63a3c-31b6-4421-8e92-b8ee97a0285b', //#TODO: Make every id dynamic by retrievinng from database
  style: mapCSS.rectangle65,
  title: 'Store65',
  isClickable: isClickable('rectangle65'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle64',
  style: mapCSS.rectangle64,
  title: 'Store64',
  isClickable: isClickable('rectangle64'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle63',
  style: mapCSS.rectangle63,
  title: 'Store63',
  isClickable: isClickable('rectangle63'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle62',
  style: mapCSS.rectangle62,
  title: 'Store62',
  isClickable: isClickable('rectangle62'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle61',
  style: mapCSS.rectangle61,
  title: 'Store61',
  isClickable: isClickable('rectangle61'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle60',
  style: mapCSS.rectangle60,
  title: 'Store60',
  isClickable: isClickable('rectangle60'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle59',
  style: mapCSS.rectangle59,
  title: 'Store59',
  isClickable: isClickable('rectangle59'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',  
},
{
  id:'rectangle58',
  style: mapCSS.rectangle58,
  title: 'Store58',
  isClickable: isClickable('rectangle58'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle57',
  style: mapCSS.rectangle57,
  title: 'Store57',
  isClickable: isClickable('rectangle57'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle56',
  style: mapCSS.rectangle56,
  title: 'Store56',
  isClickable: isClickable('rectangle56'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle55',
  style: mapCSS.rectangle55,
  title: 'Store55',
  isClickable: isClickable('rectangle55'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle54',
  style: mapCSS.rectangle54,
  title: 'Store54',
  isClickable: isClickable('rectangle54'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle53',
  style: mapCSS.rectangle53,
  title: 'Store53',
  isClickable: isClickable('rectangle53'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136" />
        </svg>,
  iconColor: '#FFFFFF',  
},
{
  id:'rectangle52',
  style: mapCSS.rectangle52,
  title: 'Store52',
  isClickable: isClickable('rectangle52'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle51',
  style: mapCSS.rectangle51,
  title: 'Store51',
  isClickable: isClickable('rectangle51'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14 14">
          <path fill="#ffffff" fillRule="evenodd" d="M3.25.5V3h7.5V.5a.5.5 0 0 0-.5-.5h-6.5a.5.5 0 0 0-.5.5m.638 9V13c0 .133.047.26.13.354a.42.42 0 0 0 .314.146h5.336a.42.42 0 0 0 .314-.146a.53.53 0 0 0 .13-.354V9.5zM.45 4.804a1.53 1.53 0 0 1 1.049-.41h11c.388 0 .766.144 1.05.41c.284.267.45.636.45 1.029v4.227c0 .393-.166.762-.45 1.03c-.284.265-.662.41-1.05.41h-1.138v-2c0-.69-.56-1.25-1.25-1.25H3.888c-.69 0-1.25.56-1.25 1.25v2H1.5c-.388 0-.766-.145-1.05-.41A1.4 1.4 0 0 1 0 10.06V5.833c0-.393.166-.762.45-1.029m8.864 1.444c0-.345.28-.625.625-.625h1.637a.625.625 0 1 1 0 1.25H9.94a.625.625 0 0 1-.625-.625Z" clipRule="evenodd" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle50',
  style: mapCSS.rectangle50,
  title: 'Store50',
  isClickable: isClickable('rectangle50'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle49',
  style: mapCSS.rectangle49,
  title: 'Store49',
  isClickable: isClickable('rectangle49'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24">
          <path fill="#fff" d="M21.75 16.25L17 21l-2.75-3l1.16-1.16L17 18.43l3.59-3.59zM17.62 12C16.31 8.1 12 3.25 12 3.25S6 10 6 14c0 3.31 2.69 6 6 6h.34c-.22-.64-.34-1.3-.34-2c0-3.18 2.5-5.78 5.62-6" strokeWidth="0.7" stroke="#fff" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle48',
  style: mapCSS.rectangle48,
  title: 'Store48',
  isClickable: isClickable('rectangle48'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
          <path fill="currentColor" d="m256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0zm22.6 150.6l118.2 118.2c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6zM64 112a48 48 0 1 1 96 0a48 48 0 1 1-96 0m48 240a48 48 0 1 1 0 96a48 48 0 1 1 0-96" />
        </svg>,
  iconColor: '#FFFFFF',  
},
{
  id:'rectangle47',
  style: mapCSS.rectangle47,
  title: 'Store47',
  isClickable: isClickable('rectangle47'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle46',
  style: mapCSS.rectangle46,
  title: 'Store46',
  isClickable: isClickable('rectangle46'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="248" height="248" viewBox="0 0 100 100">
          <path fill="#fff" d="m91.963 80.982l.023-.013l-7.285-12.617h2.867v-.013c.598 0 1.083-.484 1.083-1.082c0-.185-.059-.351-.14-.503l.019-.011l-6.737-11.669h1.639v-.009a.773.773 0 0 0 .773-.772a.76.76 0 0 0-.1-.359l.013-.008l-9.802-16.979l-.01.006a1.32 1.32 0 0 0-1.186-.754c-.524 0-.968.311-1.185.752l-.005-.003l-9.802 16.978l.002.001a.75.75 0 0 0-.105.366c0 .426.346.772.773.772v.009h1.661l-6.737 11.669l.003.001a1.06 1.06 0 0 0-.147.513c0 .598.485 1.082 1.083 1.082v.013h2.894l-2.1 3.638l-8.399-14.548h4.046v-.018c.844 0 1.528-.685 1.528-1.528c0-.26-.071-.502-.186-.717l.015-.009l-9.507-16.467h2.313v-.012a1.09 1.09 0 0 0 1.091-1.092c0-.186-.059-.353-.141-.506l.019-.011L36.4 13.125l-.005.003a1.87 1.87 0 0 0-1.683-1.06c-.758 0-1.408.452-1.704 1.1L19.201 37.082l.003.002a1.06 1.06 0 0 0-.148.516a1.09 1.09 0 0 0 1.09 1.092v.012h2.345l-9.395 16.272a1.5 1.5 0 0 0-.316.92c0 .844.685 1.528 1.528 1.528v.018h4.084L8.252 75.007c-.24.314-.387.702-.387 1.128c0 1.032.838 1.87 1.871 1.87v.021h19.779v8.43c0 .815.661 1.477 1.476 1.477h7.383c.815 0 1.477-.661 1.477-1.477v-8.43h16.12l-1.699 2.943l.003.002c-.104.189-.18.396-.18.628c0 .732.593 1.325 1.325 1.325v.015h14.016v3.941c0 .578.469 1.046 1.046 1.046h5.232c.578 0 1.046-.468 1.046-1.046v-3.941h14.05v-.015c.732 0 1.326-.593 1.326-1.325a1.3 1.3 0 0 0-.173-.617" strokeWidth="0.4" stroke="#fff" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle45',
  style: mapCSS.rectangle45,
  title: 'Store45',
  isClickable: isClickable('rectangle45'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M21.04 13.13c.14 0 .27.06.38.17l1.28 1.28c.22.21.22.56 0 .77l-1 1l-2.05-2.05l1-1c.11-.11.25-.17.39-.17m-1.97 1.75l2.05 2.05L15.06 23H13v-2.06zM3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v6L11 20v2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm2 0h2V5H5zm0 4v2h2v-2zm0 6v2h2v-2z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle44',
  style: mapCSS.rectangle44,
  title: 'Store44',
  isClickable: isClickable('rectangle44'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle43',
  style: mapCSS.rectangle43,
  title: 'Store43',
  isClickable: isClickable('rectangle43'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle42',
  style: mapCSS.rectangle42,
  title: 'Store42',
  isClickable: isClickable('rectangle42'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle41',
  style: mapCSS.rectangle41,
  title: 'Store41',
  isClickable: isClickable('rectangle41'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle40',
  style: mapCSS.rectangle40,
  title: 'Store40',
  isClickable: isClickable('rectangle40'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle39',
  style: mapCSS.rectangle39,
  title: 'Store39',
  isClickable: isClickable('rectangle39'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle38',
  style: mapCSS.rectangle38,
  title: 'Store38',
  isClickable: isClickable('rectangle38'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle37',
  style: mapCSS.rectangle37,
  title: 'Store37',
  isClickable: isClickable('rectangle37'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF',
},
{
  id:'rectangle36',
  style: mapCSS.rectangle36,
  title: 'Store36',
  isClickable: isClickable('rectangle36'),
  iconColor: '#FFFFFF',
},
{
  id:'rectangle35',
  style: mapCSS.rectangle35,
  title: 'Store35',
  isClickable: isClickable('rectangle35'),
  iconColor: '#FFFFFF',
},
{
  id:'rectangle34',
  style: mapCSS.rectangle34,
  title: 'Store34',
  isClickable: isClickable('rectangle34'),
  iconColor: '#FFFFFF',
},
{
  id:'rectangle33',
  style: mapCSS.rectangle33,
  title: 'Store33',
  isClickable: isClickable('rectangle33'),
  iconColor: '#FFFFFF',
},
{
  id:'rectangle32',
  style: mapCSS.rectangle32,
  title: 'Store32',
  isClickable: isClickable('rectangle32'),
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle31',
  style: mapCSS.rectangle31,
  title: 'Store31',
  isClickable: isClickable('rectangle31'),
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle30',
  style: mapCSS.rectangle30,
  title: 'Store30',
  isClickable: isClickable('rectangle30'),
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle29',
  style: mapCSS.rectangle29,
  title: 'Store29',
  isClickable: isClickable('rectangle29'),
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle28',
  style: mapCSS.rectangle28,
  title: 'Store28',
  isClickable: isClickable('rectangle28'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20">
          <g fill="currentColor" fillRule="evenodd" clipRule="evenodd" strokeWidth="0.1" stroke="currentColor">
            <path d="M11 3.5H6v-2h5a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H6v-2h5a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3" />
            <path d="M6 1.5a1 1 0 0 1 1 1V18a1 1 0 1 1-2 0V2.5a1 1 0 0 1 1-1" />
            <path d="M2 5.436a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle27',
  style: mapCSS.rectangle27,
  title: 'Store27',
  isClickable: isClickable('rectangle27'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="#ffffff" d="M5.707 3.879A3 3 0 0 1 7.828 3c.79 0 1.948-.22 2.302.711a2.001 2.001 0 0 0 3.74 0c.354-.93 1.513-.71 2.302-.71a3 3 0 0 1 2.12.878L22 7.586a2 2 0 0 1 0 2.828l-1.478 1.478c-.52.52-1.246.689-1.9.526l.272 5.432A3 3 0 0 1 15.898 21H8.102a3 3 0 0 1-2.996-3.15l.272-5.432a2 2 0 0 1-1.9-.526L2 10.414a2 2 0 0 1 0-2.828z" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle26',
  style: mapCSS.rectangle26,
  title: 'Store26',
  isClickable: isClickable('rectangle26'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20">
          <path fill="#fff" fillRule="evenodd" d="m7.172 11.334l2.83 1.935l2.728-1.882l6.115 6.033q-.242.079-.512.08H1.667c-.22 0-.43-.043-.623-.12zM20 6.376v9.457c0 .247-.054.481-.15.692l-5.994-5.914zM0 6.429l6.042 4.132l-5.936 5.858A1.7 1.7 0 0 1 0 15.833zM18.333 2.5c.92 0 1.667.746 1.667 1.667v.586L9.998 11.648L0 4.81v-.643C0 3.247.746 2.5 1.667 2.5z" strokeWidth="0.2" stroke="#fff" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle25',
  style: mapCSS.rectangle25,
  title: 'Store25',
  isClickable: isClickable('rectangle25'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle24',
  style: mapCSS.rectangle24,
  title: 'Store24',
  isClickable: isClickable('rectangle24'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle23',
  style: mapCSS.rectangle23,
  title: 'Store23',
  isClickable: isClickable('rectangle23'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle22',
  style: mapCSS.rectangle22,
  title: 'Store22 ',
  isClickable: isClickable('rectangle22'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14">
          <path fill="#ffffff" fillRule="evenodd" d="M3.25.5V3h7.5V.5a.5.5 0 0 0-.5-.5h-6.5a.5.5 0 0 0-.5.5m.638 9V13c0 .133.047.26.13.354a.42.42 0 0 0 .314.146h5.336a.42.42 0 0 0 .314-.146a.53.53 0 0 0 .13-.354V9.5zM.45 4.804a1.53 1.53 0 0 1 1.049-.41h11c.388 0 .766.144 1.05.41c.284.267.45.636.45 1.029v4.227c0 .393-.166.762-.45 1.03c-.284.265-.662.41-1.05.41h-1.138v-2c0-.69-.56-1.25-1.25-1.25H3.888c-.69 0-1.25.56-1.25 1.25v2H1.5c-.388 0-.766-.145-1.05-.41A1.4 1.4 0 0 1 0 10.06V5.833c0-.393.166-.762.45-1.029m8.864 1.444c0-.345.28-.625.625-.625h1.637a.625.625 0 1 1 0 1.25H9.94a.625.625 0 0 1-.625-.625Z" clipRule="evenodd" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle21',
  style: mapCSS.rectangle21,
  title: 'Store21',
  isClickable: isClickable('rectangle21'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14">
          <path fill="#ffffff" fillRule="evenodd" d="M3.25.5V3h7.5V.5a.5.5 0 0 0-.5-.5h-6.5a.5.5 0 0 0-.5.5m.638 9V13c0 .133.047.26.13.354a.42.42 0 0 0 .314.146h5.336a.42.42 0 0 0 .314-.146a.53.53 0 0 0 .13-.354V9.5zM.45 4.804a1.53 1.53 0 0 1 1.049-.41h11c.388 0 .766.144 1.05.41c.284.267.45.636.45 1.029v4.227c0 .393-.166.762-.45 1.03c-.284.265-.662.41-1.05.41h-1.138v-2c0-.69-.56-1.25-1.25-1.25H3.888c-.69 0-1.25.56-1.25 1.25v2H1.5c-.388 0-.766-.145-1.05-.41A1.4 1.4 0 0 1 0 10.06V5.833c0-.393.166-.762.45-1.029m8.864 1.444c0-.345.28-.625.625-.625h1.637a.625.625 0 1 1 0 1.25H9.94a.625.625 0 0 1-.625-.625Z" clipRule="evenodd" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle20',
  style: mapCSS.rectangle20,
  title: 'Store20',
  isClickable: isClickable('rectangle20'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle19',
  style: mapCSS.rectangle19,
  title: 'Store19',
  isClickable: isClickable('rectangle19'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
          <path fill="#ffffff" d="M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle18',
  style: mapCSS.rectangle18,
  title: 'Store18',
  isClickable: isClickable('rectangle18'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="#ffffff" d="M5.707 3.879A3 3 0 0 1 7.828 3c.79 0 1.948-.22 2.302.711a2.001 2.001 0 0 0 3.74 0c.354-.93 1.513-.71 2.302-.71a3 3 0 0 1 2.12.878L22 7.586a2 2 0 0 1 0 2.828l-1.478 1.478c-.52.52-1.246.689-1.9.526l.272 5.432A3 3 0 0 1 15.898 21H8.102a3 3 0 0 1-2.996-3.15l.272-5.432a2 2 0 0 1-1.9-.526L2 10.414a2 2 0 0 1 0-2.828z" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle17',
  style: mapCSS.rectangle17,
  title: 'Store17',
  isClickable: isClickable('rectangle17'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="#ffffff" d="M5.707 3.879A3 3 0 0 1 7.828 3c.79 0 1.948-.22 2.302.711a2.001 2.001 0 0 0 3.74 0c.354-.93 1.513-.71 2.302-.71a3 3 0 0 1 2.12.878L22 7.586a2 2 0 0 1 0 2.828l-1.478 1.478c-.52.52-1.246.689-1.9.526l.272 5.432A3 3 0 0 1 15.898 21H8.102a3 3 0 0 1-2.996-3.15l.272-5.432a2 2 0 0 1-1.9-.526L2 10.414a2 2 0 0 1 0-2.828z" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle16',
  style: mapCSS.rectangle16,
  title: 'Store16',
  isClickable: isClickable('rectangle16'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
          <path fill="currentColor" d="m256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0zm22.6 150.6l118.2 118.2c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6zM64 112a48 48 0 1 1 96 0a48 48 0 1 1-96 0m48 240a48 48 0 1 1 0 96a48 48 0 1 1 0-96" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle15',
  style: mapCSS.rectangle15,
  title: 'Store15',
  isClickable: isClickable('rectangle15'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle14',
  style: mapCSS.rectangle14,
  title: 'Store14',
  isClickable: isClickable('rectangle14'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M169.7.9c-22.8-1.6-41.9 14-47.5 34.7L110.4 80h1.6c176.7 0 320 143.3 320 320v1.6l44.4-11.8c20.8-5.5 36.3-24.7 34.7-47.5C498.5 159.5 352.5 13.5 169.7.9m230.1 409.3c.1-3.4.2-6.8.2-10.2c0-159.1-128.9-288-288-288c-3.4 0-6.8.1-10.2.2L.5 491.9c-1.5 5.5.1 11.4 4.1 15.4s9.9 5.6 15.4 4.1zM176 208a32 32 0 1 1 0 64a32 32 0 1 1 0-64m64 128a32 32 0 1 1 64 0a32 32 0 1 1-64 0M96 384a32 32 0 1 1 64 0a32 32 0 1 1-64 0" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle13',
  style: mapCSS.rectangle13,
  title: 'Store13',
  isClickable: isClickable('rectangle13'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M169.7.9c-22.8-1.6-41.9 14-47.5 34.7L110.4 80h1.6c176.7 0 320 143.3 320 320v1.6l44.4-11.8c20.8-5.5 36.3-24.7 34.7-47.5C498.5 159.5 352.5 13.5 169.7.9m230.1 409.3c.1-3.4.2-6.8.2-10.2c0-159.1-128.9-288-288-288c-3.4 0-6.8.1-10.2.2L.5 491.9c-1.5 5.5.1 11.4 4.1 15.4s9.9 5.6 15.4 4.1zM176 208a32 32 0 1 1 0 64a32 32 0 1 1 0-64m64 128a32 32 0 1 1 64 0a32 32 0 1 1-64 0M96 384a32 32 0 1 1 64 0a32 32 0 1 1-64 0" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle12',
  style: mapCSS.rectangle12,
  title: 'Store12',
  isClickable: isClickable('rectangle12'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
            <path fill="#ffffff" d="M17 4v9c0 1.66 -1.34 3 -3 3h-6c-1.66 0 -3 -1.34 -3 -3v-9Z" />
            <path d="M17 4h3c0.55 0 1 0.45 1 1v3c0 0.55 -0.45 1 -1 1h-3" />
            <path d="M11 20h8M11 20h-8" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle11',
  style: mapCSS.rectangle11,
  title: 'Store11',
  isClickable: isClickable('rectangle11'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle10',
  style: mapCSS.rectangle10,
  title: 'Store10',
  isClickable: isClickable('rectangle10'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512">
          <path fill="#ffffff" d="M256.03 76.47c-12.332-.298-23.413 6.18-23.06 22.468L18.655 273l.282 6.938v178.998l11.468-2.686l155.906-36.563l5.438 17.688l29.72-3.344l-3.407-21.81l69.312-16.25l8.844 10.25l21.842 1.624l-.937-18.844l121.938-28.625v.03c1.36-.2 2.667-.52 3.937-.936c.022-.01.04-.025.063-.033l20.812-4.875l7.22-1.687v-7.188l18.53-147.406c8.89-17.113-6.495-46.453-38.72-40.124c4.752-19.91-38.983-28.136-52.03-17.25c3.263-18.202-37.385-41.715-51.906-21.187c4.632-22.758-46.006-40.867-58.845-20.345c-2.41-13.453-18.07-22.568-32.094-22.906zm-10.28 39.655c2.336 2.81 7.442 5.542 13.406 6.844c5.964 1.3 12.622 1.13 16.375.155l8.94-2.313l2.436 8.938c2.21 8.203 6.852 11.33 14.438 12.97s17.768.34 25.844-2.876l10.375-4.156l2.25 10.937c1 4.886 7.39 11.092 16.343 14.313c8.954 3.22 19.15 2.73 23.53 0l11.283-7.032l2.78 13c1.227 5.752 4.534 9.73 9.656 12.594s12.08 4.212 19.063 3.375l2.25 18.563c-10.635 1.274-21.384-.563-30.44-5.625c-6.057-3.388-11.185-8.528-14.75-14.844c-9.637 2.4-20.165.986-29.686-2.44c-9.78-3.517-19.263-9.534-24.594-18.468c-8.934 2.288-18.56 2.914-27.844.907c-10.046-2.173-19.796-8.438-25.312-18.532c-5.44.405-11.155.037-16.906-1.22c-8.71-1.9-17.57-5.648-23.813-13.155l14.375-11.938zM434.78 232.28l.095.345c1.64-.385 1.946-.3 3.656 1.094c1.712 1.39 4.14 4.616 6.22 9.343c4.058 9.22 6.91 23.626 7.656 38.5v16c-.504 10.182-1.96 19.874-4.312 27.53c-1.743 5.672-3.982 10.19-6.156 12.938c-1.516 1.917-2.777 2.92-4 3.44L37.625 435.374V307.312c132.618-34.5 265.01-62.72 397.156-75.03zm-72.25 177.095l-26.436 3.063l14.562 21.312l24.97-4.438zm-62.78 25.03l-32 5.22l11.156 12.938l21.875 1.625l-1.03-19.782zm-157.25 29.5l-1.625 14.908l22.47 2.937l8.436-15.313l-29.28-2.53zm107.406 4.72l-24.312 3.156l1.75 16.158l31.687-2.75l-9.124-16.563z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle9',
  style: mapCSS.rectangle9,
  title: 'Restroom',
  isClickable: isClickable('rectangle9'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 640 512">
          <path fill="#ffffff" d="M80 48a48 48 0 1 1 96 0a48 48 0 1 1-96 0m40 304v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V325.2c-8.1 9.2-21.1 13.2-33.5 9.4c-16.9-5.3-26.3-23.2-21-40.1l30.9-99.1C44.9 155.3 82 128 124 128h8c42 0 79.1 27.3 91.6 67.4l30.9 99.1c5.3 16.9-4.1 34.8-21 40.1c-12.4 3.9-25.4-.2-33.5-9.4V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352zM320 0c13.3 0 24 10.7 24 24v464c0 13.3-10.7 24-24 24s-24-10.7-24-24V24c0-13.3 10.7-24 24-24m144 48a48 48 0 1 1 96 0a48 48 0 1 1-96 0m-24 432v-96h-17.8c-10.9 0-18.6-10.7-15.2-21.1l9-26.9c-3.2 0-6.4-.5-9.5-1.5c-16.9-5.3-26.3-23.2-21-40.1l29.7-95.2c13.2-42.3 52.4-71.2 96.8-71.2s83.6 28.9 96.8 71.2l29.7 95.2c5.3 16.9-4.1 34.8-21 40.1c-3.2 1-6.4 1.5-9.5 1.5l9 26.9c3.5 10.4-4.3 21.1-15.2 21.1H584v96c0 17.7-14.3 32-32 32s-32-14.3-32-32v-96h-16v96c0 17.7-14.3 32-32 32s-32-14.3-32-32" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle8',
  style: mapCSS.rectangle8,
  title: 'Store8',
  isClickable: isClickable('rectangle8'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="#ffffff" d="M5.707 3.879A3 3 0 0 1 7.828 3c.79 0 1.948-.22 2.302.711a2.001 2.001 0 0 0 3.74 0c.354-.93 1.513-.71 2.302-.71a3 3 0 0 1 2.12.878L22 7.586a2 2 0 0 1 0 2.828l-1.478 1.478c-.52.52-1.246.689-1.9.526l.272 5.432A3 3 0 0 1 15.898 21H8.102a3 3 0 0 1-2.996-3.15l.272-5.432a2 2 0 0 1-1.9-.526L2 10.414a2 2 0 0 1 0-2.828z" />
          </g>
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle7',
  style: mapCSS.rectangle7,
  title: 'Store7',
  isClickable: isClickable('rectangle7'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle6',
  style: mapCSS.rectangle6,
  title: 'Store6',
  isClickable: isClickable('rectangle6'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle5',
  style: mapCSS.rectangle5,
  title: 'Store5',
  isClickable: isClickable('rectangle5'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle4',
  style: mapCSS.rectangle4,
  title: 'Store4',
  isClickable: isClickable('rectangle4'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 576 512">
          <path fill="#fff" d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle3',
  style: mapCSS.rectangle3,
  title: 'Store3',
  isClickable: isClickable('rectangle3'),
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M20.16 12.73A6.27 6.27 0 0 0 19.09 3c-2.01-1.33-4.7-1.34-6.73-.03c-1.76 1.13-2.73 2.89-2.9 4.71c-.13 1.32-.63 2.55-1.55 3.47l-.03.03c-1.16 1.16-1.16 2.93-.07 4.01l.99.99a2.794 2.794 0 0 0 3.95 0c.97-.97 2.25-1.5 3.64-1.65c1.37-.15 2.71-.75 3.77-1.8m-13.9 7.13c.27.56.18 1.24-.29 1.7a1.49 1.49 0 0 1-2.55-.98a1.49 1.49 0 0 1-.98-2.55c.46-.46 1.15-.56 1.7-.29l2.48-2.43c.14.19.3.41.48.59l.99.99c.21.2.41.37.67.52z" />
        </svg>,
  iconColor: '#FFFFFF', 
},
{
  id:'rectangle2',
  style: mapCSS.rectangle2,
  title: 'Store2',
  isClickable: isClickable('rectangle2'),
  iconColor: '#FFFFFF', 
},
// {
//   id:'rectangle1',
//   style: mapCSS.rectangle1,
//   title: 'Store1',
//   isClickable: isClickable('rectangle1'),
//   icon: '',
//   iconColor: '#FFFFFF', 
// }
]

export const getTooltipPosition = (rectangleId: string) => {
  // Special cases for specific stores
  if (rectangleId === 'rectangle10' || rectangleId === 'rectangle9') {
    return 'bottom'; // Treat Store 10 and Restroom as topmost stores
  }
  
  const rect = mapCSS[rectangleId];
  if (!rect) return 'top'; // Default position
  
  const left = parseInt(rect.left as string);
  const top = parseInt(rect.top as string);
  
  // Right edge of the map
  if (left > 2200) return 'left';
  // Left edge of the map
  if (left < 300) return 'right';
  // Top edge of the map
  if (top < 250) return 'bottom';
  // Bottom edge of the map
  if (top > 1200) return 'top';
  
  // Default position
  return 'top';
};