import React from "react";

interface MapBlockProps {
    rowStart: number, 
    rowEnd: number,
    colStart: number,
    colEnd: number,
    width?: number,
    height?: number,
}

const MapBlock: React.FC<MapBlockProps> = ({ rowStart, rowEnd, colStart, colEnd, width, height }) => {
    return (
        <div 
            className="text-black bg-green-400 rounded-[8px]"
            style={{
                gridRowStart: `${rowStart}`,
                gridRowEnd: `${rowEnd}`,
                gridColumnStart: `${colStart}`,
                gridColumnEnd: `${colEnd}`,
                width: `${width ? width : 100}%`,
                height: `${height ? height : 100}%`,
            }}
        >
        </div>
    )
}

export default MapBlock;