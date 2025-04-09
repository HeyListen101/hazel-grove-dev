"use client";

import React, { useState, useEffect, useRef } from 'react';
import { rectangleData, getTooltipPosition } from '@/components/assets/background-images/map';
import MapRectangle from './map-rectangle';

const Rectangles = () => {
  const [scale, setScale] = useState(1);
  const [selectedRectangle, setSelectedRectangle] = useState<string | null>(null);
  const containerRef = useRef(null);
  const originalWidth = 2560;
  const originalHeight = 1440;
  const headerHeight = 60;

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
  
      const container = containerRef.current as HTMLDivElement;
      const availableHeight = window.innerHeight - headerHeight;
      const availableWidth = container.offsetWidth;
      
      const widthScale = availableWidth / originalWidth;
      const heightScale = availableHeight / originalHeight;
      
      setScale(Math.min(widthScale, heightScale) * 1.08);
    };
  
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleRectangleClick = (rectangleId: string) => {
    setSelectedRectangle(rectangleId);
    console.log(`Rectangle ${rectangleId} clicked`);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div
        style={{
          position: 'absolute',
          width: `${originalWidth}px`,
          height: `${originalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          left: '50%',
          marginLeft: `-${originalWidth / 2}px`,
          top: '-0.5rem',
        }}
      >
        {rectangleData.map(rect => (
          <MapRectangle
            key={rect.id}
            id={rect.id}
            style={rect.style}
            title={rect.title}
            isClickable={rect.isClickable}
            icon={rect.icon}
            iconColor={rect.iconColor}
            isSelected={selectedRectangle === rect.id}
            getTooltipPosition={getTooltipPosition}
            onClick={handleRectangleClick}
          />
        ))}
      </div>
    </div>
  );
}

export default Rectangles;