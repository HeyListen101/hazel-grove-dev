// components/resolution-guard.tsx (or wherever you put it)
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ResolutionGuardProps {
  minWidth: number;
  minHeight: number;
  children: React.ReactNode;
}

const ResolutionGuard: React.FC<ResolutionGuardProps> = ({ minWidth, minHeight, children }) => {
  const [isResolutionOk, setIsResolutionOk] = useState<boolean>(true);

  const checkResolution = useCallback(() => {
    if (typeof window !== 'undefined') {
      const ok = window.innerWidth >= minWidth && window.innerHeight >= minHeight;
      setIsResolutionOk(ok);
    } else {
      setIsResolutionOk(true); // Assume OK during SSR
    }
  }, [minWidth, minHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkResolution();
    window.addEventListener('resize', checkResolution);
    return () => {
      window.removeEventListener('resize', checkResolution);
    };
  }, [checkResolution]);

  if (isResolutionOk) {
    return <>{children}</>;
  } else {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <p className="text-black text-center text-lg font-medium p-4">
          The app requires a minimum resolution of {minWidth}x{minHeight} pixels and cannot be rendered at this size.
        </p>
      </div>
    );
  }
};

export default ResolutionGuard;