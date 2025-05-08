"use client"

import { useEffect } from 'react';

const PreventZoomWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        (event.key === '=' || event.key === '-' || event.key === '+')
      ) {
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    // Attach listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return <>{children}</>;
};

export default PreventZoomWrapper;
