// store-component.tsx
'use client';

import StoreCard from './ui/store-card';
import { useMapSearch } from './map-search-context';
import VisitaPlaceholder from './visita-placeholder';

export default function StoreComponent() {
    const {
        selectedStoreId,
        storeName,
    } = useMapSearch();

    return (
        <div
            className={`
                w-full h-[95vh] sm:h-[50vh]
                bg-white overflow-hidden
                shadow-lg pointer-events-auto
                md:absolute md:rounded-[15px] md:z-[20] md:h-auto md:w-auto
                store-mobile-absolute
            `}
            style={{
                // Only desktop absolute positioning here
                left: '12.5%',
                top: '25%',
                width: '27.5%',
                height: '70%',
            }}
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