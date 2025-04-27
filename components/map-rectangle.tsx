import React from 'react';
import MapTooltip from './map-tooltip';

interface RectangleProps {
  id: string;
  style: React.CSSProperties;
  title: string;
  isClickable: boolean;
  icon?: React.ReactNode;
  iconColor?: string;
  isSelected: boolean;
  getTooltipPosition: (id: string) => 'top' | 'right' | 'bottom' | 'left';
  onClick: (id: string) => void;
}

const MapRectangle: React.FC<RectangleProps> = ({
  id,
  style,
  title,
  isClickable,
  icon,
  iconColor,
  isSelected,
  getTooltipPosition,
  onClick
}) => {
  const isRectangle46 = id === 'rectangle46';
  const clickable = isClickable && !isRectangle46;
  
  const getStyleWithSelection = (baseStyle: React.CSSProperties): React.CSSProperties => {
    if (isSelected) {
      return {
        ...baseStyle,
        zIndex: 10,
      };
    }
    return baseStyle;
  };

  return (
    <div
      key={id}
      style={clickable ? getStyleWithSelection(style) : style}
      onClick={clickable ? () => onClick(id) : undefined}
      role={clickable ? "Button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick(id) : undefined}
      className={clickable ? "cursor-pointer transition-colors duration-200 hover:bg-opacity-80" : "pointer-events-none"}
    >
      {/* Icon Display */}
      {icon && (isClickable || isRectangle46) && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          color: iconColor || 'white'
        }}>
          {icon}
        </div>
      )}
      
      {/* Tooltip */}
      {isSelected && isClickable && (
        <MapTooltip 
          title={title} 
          position={getTooltipPosition(id)} 
        />
      )}
    </div>
  );
};

export default MapRectangle;