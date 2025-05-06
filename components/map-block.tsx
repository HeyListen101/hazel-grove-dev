import React from "react";

interface MapBlockProps {
    storeId?: string,
    rowStart: number, 
    rowEnd: number,
    colStart: number,
    colEnd: number,
    color: string,
    width?: number,
    height?: number,
    icon?: string,
    viewBox?: string,
    clickBlock?: (id: string) => void,
}

const MapBlock: React.FC<MapBlockProps> = ({ storeId, rowStart, rowEnd, colStart, colEnd, color, width, height, icon, viewBox, clickBlock }) => {
    return (
        <div 
            id={storeId}
            className="text-black bg-green-400 rounded-[8px] flex items-center justify-center cursor-pointer"
            style={{
                gridRowStart: `${rowStart}`,
                gridRowEnd: `${rowEnd}`,
                gridColumnStart: `${colStart}`,
                gridColumnEnd: `${colEnd}`,
                backgroundColor: `${color}`,
                width: `${width ? width : 100}%`,
                height: `${height ? height : 100}%`,
            }}
            onClick={() => clickBlock && storeId && clickBlock(storeId)}
        >
            { icon &&
            <svg xmlns="http://www.w3.org/2000/svg" width="40%" height="auto" viewBox={viewBox} className="">
                <path fill="#ffffff" d={icon} />
            </svg>
            }
        </div>
    )
}

export default MapBlock;