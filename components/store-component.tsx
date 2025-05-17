// store-component.tsx
'use client';

import StoreCard from './ui/store-card';
import { useMapSearch } from './map-search-context';
import VisitaPlaceholder from './visita-placeholder';
// No need for react-responsive

export default function StoreComponent() {
    const {
        selectedStoreId,
        storeName,
    } = useMapSearch();

    // Base styles for mobile (block layout, specific height)
    // Desktop styles (md:) for absolute positioning
    // The 'left', 'top', 'width', 'height' for desktop are now inline styles
    // because Tailwind doesn't have utilities for arbitrary percentage values like left-[12.5%].
    // If these percentages were standard Tailwind spacing/fractions, you could use classes.

    const desktopAbsoluteStyles: React.CSSProperties = {
        // These are applied only on 'md' and up due to className logic
        left: `${((6 - 1) / 40) * 100}%`,    // colStart 6 -> 12.5%
        top: `${((6 - 1) / 20) * 100}%`,     // rowStart 6 -> 25%
        width: `${((16 - 5) / 40) * 100}%`,  // 11/40 -> 27.5%
        height: `${((19 - 5) / 20) * 100}%`, // 14/20 -> 70%
    };
    
    return (
        <div
            // Mobile styles (default):
            // Takes a portion of the screen height, standard block flow.
            // Desktop styles (md:):
            // Becomes absolutely positioned, specific z-index, and applies calculated dimensions.
            className={`
                w-full h-[95vh] sm:h-[50vh]             
                bg-white overflow-hidden                
                shadow-lg                               
                pointer-events-auto                     
                md:absolute                             
                md:rounded-[15px]                       
                md:z-[20]                               
                md:h-auto md:w-auto                     
            `}
            // Apply calculated absolute position styles only on desktop
            // For mobile, these values in 'style' would be ignored or less relevant
            // due to block layout. We rely on className for mobile height.
            // To be very explicit, you could conditionally apply the style object:
            // style={typeof window !== 'undefined' && window.innerWidth >= 768 ? desktopAbsoluteStyles : {}}
            // But Tailwind prefixes on className are usually enough to control when these matter.
            // The `md:h-auto md:w-auto` ensures the % in style take precedence on desktop.
            style={desktopAbsoluteStyles}
        >
            {selectedStoreId ? (
                <StoreCard
                    storeId={selectedStoreId}
                    isSelected={!!selectedStoreId}
                    storeName={storeName || 'Loading...'}
                />
            ) : (
                <VisitaPlaceholder />
            )}
        </div>
    );
}