import React from "react";

interface MapBlockProps {
    rowStart: number, 
    rowEnd: number,
    colStart: number,
    colEnd: number,
    color: string,
    width?: number,
    height?: number,
}

const MapBlock: React.FC<MapBlockProps> = ({ rowStart, rowEnd, colStart, colEnd, color, width, height }) => {
    return (
        <div 
            className="text-black bg-green-400 rounded-[8px]"
            style={{
                gridRowStart: `${rowStart}`,
                gridRowEnd: `${rowEnd}`,
                gridColumnStart: `${colStart}`,
                gridColumnEnd: `${colEnd}`,
                backgroundColor: `${color}`,
                width: `${width ? width : 100}%`,
                height: `${height ? height : 100}%`,
            }}
        >
        </div>
    )
}

export default MapBlock;