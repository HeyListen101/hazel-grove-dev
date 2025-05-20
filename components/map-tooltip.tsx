import React, { useState, useEffect } from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

type MapTooltipProps = {
  name?: string;
  position: TooltipPosition;
  rowStart?: number;
  rowEnd?: number;
  colStart?: number;
  colEnd?: number;
}

const MOBILE_BREAKPOINT = 526; // Match your globals.css

const MapTooltip: React.FC<MapTooltipProps> = ({
  name, 
  position,
  rowStart,
  rowEnd,
  colStart,
  colEnd
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    
    checkMobile(); // Check on mount
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Define sizes based on mobile state - Made smaller for mobile
  const tooltipPadding = isMobile ? '2px 4px' : '8px 16px';          // Smaller padding
  const tooltipFontSize = isMobile ? '5px' : '16px';         // Smaller font
  const tooltipBorderRadius = isMobile ? '2px' : '8px';     // Smaller border radius
  const pointerSize = isMobile ? 4 : 10;                      // Smaller pointer
  // Adjust pointerOffset carefully if pointerSize changes significantly
  const pointerOffset = isMobile ? `-${pointerSize - 1}px` : `-${pointerSize - 2}px`; 

  let tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgb(97, 85, 63)',
    color: 'white',
    padding: tooltipPadding,
    borderRadius: tooltipBorderRadius,
    fontSize: tooltipFontSize,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.15)', // Slightly reduced shadow for smaller look
    pointerEvents: 'none',
    opacity: 1, 
    transform: 'translate(0, 0)', 
  };
  
  let pointerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    opacity: 1,
  };
  
  if (rowStart && rowEnd && colStart && colEnd) {
    // Adjust transform for mobile to be less aggressive
    const translateXValue = isMobile ? '15%' : '40%'; // Reduced offset
    const translateYValue = isMobile ? '15%' : '30%'; // Reduced offset

    tooltipStyle = {
      ...tooltipStyle,
      gridRowStart: `${position === 'top' ? rowStart - 1 : position === 'bottom' ? rowEnd : rowStart}`,
      gridRowEnd: `${position === 'top' ? rowStart : position === 'bottom' ? rowEnd + 1 : rowEnd}`,
      gridColumnStart: `${position === 'left' ? colStart - 1 : position === 'right' ? colEnd : colStart}`,
      gridColumnEnd: `${position === 'left' ? colStart : position === 'right' ? colEnd + 1 : colEnd}`,
      margin: '0',
      transform: position === 'right' ? `translateX(${translateXValue})` : 
                   position === 'left' ? `translateX(-${translateXValue})` : 
                   position === 'top' ? `translateY(-${translateYValue})` : 
                   position === 'bottom'? `translateY(${translateYValue})` : `translateY(-${translateYValue})`,
    };
    
    if (position === 'left') {
      pointerStyle = {
        ...pointerStyle,
        right: pointerOffset, 
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: `${pointerSize}px solid transparent`,
        borderBottom: `${pointerSize}px solid transparent`,
        borderLeft: `${pointerSize}px solid rgb(97, 85, 63)`,
      };
    } else if (position === 'right') {
      pointerStyle = {
        ...pointerStyle,
        left: pointerOffset, 
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: `${pointerSize}px solid transparent`,
        borderBottom: `${pointerSize}px solid transparent`,
        borderRight: `${pointerSize}px solid rgb(97, 85, 63)`,
      };
    } else if (position === 'bottom') {
      pointerStyle = {
        ...pointerStyle,
        top: pointerOffset, 
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `${pointerSize}px solid transparent`,
        borderRight: `${pointerSize}px solid transparent`,
        borderBottom: `${pointerSize}px solid rgb(97, 85, 63)`,
      };
    } else { // 'top' (default)
      pointerStyle = {
        ...pointerStyle,
        bottom: pointerOffset, 
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `${pointerSize}px solid transparent`,
        borderRight: `${pointerSize}px solid transparent`,
        borderTop: `${pointerSize}px solid rgb(97, 85, 63)`,
      };
    }
  } 
  
  return (
    <div style={tooltipStyle} className="tooltip">
      {process.env.NEXT_PUBLIC_SHOW_TOOLTIPS === 'true' ? name : 'Viewing'}
      <div style={pointerStyle}></div>
    </div>
  );
};

export default MapTooltip;