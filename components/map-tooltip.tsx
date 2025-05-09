import React from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

type MapTooltipProps = {
  // id?: string; // add this if you want to debug
  name?: string;
  position: TooltipPosition;
  rowStart?: number;
  rowEnd?: number;
  colStart?: number;
  colEnd?: number;
}

const MapTooltip: React.FC<MapTooltipProps> = ({ 
  // id, add this if you want to debug
  name, 
  position,
  rowStart,
  rowEnd,
  colStart,
  colEnd
}) => {
  // Base tooltip styles
  let tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgb(97, 85, 63)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none',
    opacity: '1 !important',
    transform: 'translate(0, 0)', // Default transform
  };
  
  // Base pointer styles
  let pointerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    opacity: '1 !important',
  };
  
  // If grid coordinates are provided, use them for positioning
  if (rowStart && rowEnd && colStart && colEnd) {
    tooltipStyle = {
      ...tooltipStyle,
      position: 'absolute',
      gridRowStart: `${position === 'top' ? rowStart - 1 : position === 'bottom' ? rowEnd : rowStart}`,
      gridRowEnd: `${position === 'top' ? rowStart : position === 'bottom' ? rowEnd + 1 : rowEnd}`,
      gridColumnStart: `${position === 'left' ? colStart - 1 : position === 'right' ? colEnd : colStart}`,
      gridColumnEnd: `${position === 'left' ? colStart : position === 'right' ? colEnd + 1 : colEnd}`,
      margin: '0',
      transform: 'none',
    };
    
    // Adjust pointer position based on tooltip position in grid
    if (position === 'left') {
      pointerStyle = {
        ...pointerStyle,
        right: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: '10px solid rgb(97, 85, 63)',
      };
    } else if (position === 'right') {
      pointerStyle = {
        ...pointerStyle,
        left: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderRight: '10px solid rgb(97, 85, 63)',
      };
    } else if (position === 'bottom') {
      pointerStyle = {
        ...pointerStyle,
        top: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '10px solid rgb(97, 85, 63)',
      };
    } else { // 'top' (default)
      pointerStyle = {
        ...pointerStyle,
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid rgb(97, 85, 63)',
      };
    }
  } else {
    // Fallback to the original absolute positioning if grid coordinates aren't provided
    if (position === 'left') {
      tooltipStyle = {
        ...tooltipStyle,
        top: '50%',
        right: '100%',
        transform: 'translateY(-50%)',
        marginRight: '10px',
        zIndex: 1000,
      };
      pointerStyle = {
        ...pointerStyle,
        top: '50%',
        right: '-10px',
        transform: 'translateY(-50%)',
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: '10px solid rgb(97, 85, 63)',
        zIndex: 1000,
      };
    } else if (position === 'right') {
      tooltipStyle = {
        ...tooltipStyle,
        top: '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        marginLeft: '10px',
        zIndex: 1000,
      };
      pointerStyle = {
        ...pointerStyle,
        top: '50%',
        left: '-10px',
        transform: 'translateY(-50%)',
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderRight: '10px solid rgb(97, 85, 63)',
        zIndex: 1000,
      };
    } else if (position === 'bottom') {
      tooltipStyle = {
        ...tooltipStyle,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '10px',
        zIndex: 1000,
      };
      pointerStyle = {
        ...pointerStyle,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '10px solid rgb(97, 85, 63)',
        zIndex: 1000,
      };
    } else { // 'top' (default)
      tooltipStyle = {
        ...tooltipStyle,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '10px',
        zIndex: 1000,
      };
      pointerStyle = {
        ...pointerStyle,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid rgb(97, 85, 63)',
        zIndex: 1000,
      };
    }
  }
  
  return (
    <div style={tooltipStyle} className="tooltip">
      {process.env.NEXT_PUBLIC_SHOW_TOOLTIPS === 'true' ? name : 'Viewing'} {/* change this to id if you want to debug */}
      <div style={pointerStyle}></div>
    </div>
  );
};

export default MapTooltip;