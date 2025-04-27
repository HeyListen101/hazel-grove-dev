import React from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface MapTooltipProps {
  title: string;
  position: TooltipPosition;
}

const MapTooltip: React.FC<MapTooltipProps> = ({ title, position }) => {
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
  };
  
  // Base pointer styles
  let pointerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    opacity: '1 !important',
  };
  
  // Position tooltip and pointer based on location
  if (position === 'left') {
    tooltipStyle = {
      ...tooltipStyle,
      top: '50%',
      right: '100%',
      transform: 'translateY(-50%)',
      marginRight: '0px',
      paddingRight: '10px',
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
      marginLeft: '15px',
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
      marginTop: '15px',
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
      marginBottom: '15px',
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
  
  return (
    <div style={tooltipStyle}>
      {process.env.NEXT_PUBLIC_SHOW_TOOLTIPS === 'true' ? title : 'Viewing'}
      <div style={pointerStyle}></div>
    </div>
  );
};

export default MapTooltip;