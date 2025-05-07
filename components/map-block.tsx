"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { color } from '@/components/assets/background-images/icons';
import { stat } from "node:fs/promises";

interface MapBlockProps {
    storeId?: string,
    rowStart: number, 
    rowEnd: number,
    colStart: number,
    colEnd: number,
    defaultColor: string,
    width?: number,
    height?: number,
    icon?: string,
    viewBox?: string,
    radius?: string,
    clickBlock?: (id: string) => void,
}

const MapBlock: React.FC<MapBlockProps> = ({ storeId, rowStart, rowEnd, colStart, colEnd, defaultColor, width, height, icon, viewBox, clickBlock, radius }) => {
    const supabase = createClient();
    const [bgColor, setBgColor] = useState(defaultColor);
    
    useEffect(() => {
        const fetchStoreStatus = async () => {
            const { data, error } = await supabase
            .from('store')
            .select('storestatus')
            .eq('storeid', storeId);

            const statusId = data ? data[0] : null;

            if (statusId?.storestatus) {
                const { data, error } = await supabase
                .from('storestatus')
                .select('status')
                .eq('storestatusid', statusId.storestatus);

                const status = (data != null) ? data[0] : null;

                setBgColor(status?.status ? defaultColor : color.g);
            }
        }

        if (storeId) {
            fetchStoreStatus();
        }
    });

    return (
        <div 
            id={storeId}
            className="text-black flex items-center justify-center cursor-pointer"
            style={{
                gridRowStart: `${rowStart}`,
                gridRowEnd: `${rowEnd}`,
                gridColumnStart: `${colStart}`,
                gridColumnEnd: `${colEnd}`,
                backgroundColor: `${bgColor}`,
                width: `${width ? width : 100}%`,
                height: `${height ? height : 100}%`,
                borderRadius: `${radius ? radius : 8}px`,
            }}
            onClick={() => clickBlock && storeId && clickBlock(storeId)}
        >
            { icon &&
            <svg xmlns="http://www.w3.org/2000/svg" width="40%" viewBox={viewBox} className="">
                <path fill="#ffffff" d={icon} />
            </svg>
            }
        </div>
    )
}

export default MapBlock;