// src/contexts/EditCooldownContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

const COOLDOWN_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const LOCAL_STORAGE_COOLDOWN_KEY = 'editCooldownEndTime';

interface EditCooldownContextType {
  isEditCooldownActive: boolean;
  editCooldownEndTime: number | null;
  triggerGlobalEditCooldown: () => void;
  getGlobalCooldownRemainingTime: () => string;
  globalCooldownError: string | null;
  clearGlobalCooldownError: () => void; // To manually clear error message if needed
  clearCooldownManually: () => void; // For debugging/testing if needed
}

const EditCooldownContext = createContext<EditCooldownContextType | undefined>(undefined);

export const EditCooldownProvider = ({ children }: { children: ReactNode }) => {
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [cooldownError, setCooldownError] = useState<string | null>(null);

  // Effect to initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
        const storedEndTimeString = localStorage.getItem(LOCAL_STORAGE_COOLDOWN_KEY);
        if (storedEndTimeString) {
            const storedEndTime = parseInt(storedEndTimeString, 10);
            if (!isNaN(storedEndTime) && storedEndTime > Date.now()) {
                setCooldownEndTime(storedEndTime);
                setIsCooldownActive(true);
                setCooldownError(`Typing is temporarily disabled due to a previous malicious input attempt. Please try again in ${Math.max(0, Math.ceil((storedEndTime - Date.now()) / 1000 / 60))} mins.`);
                console.log("Global edit cooldown restored from localStorage.");
            } else {
                // Stored time is invalid or in the past, clear it
                localStorage.removeItem(LOCAL_STORAGE_COOLDOWN_KEY);
            }
        }
    }
  }, []); // Run only once on mount

  // Effect to manage the timer and clear localStorage when cooldown ends
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isCooldownActive && cooldownEndTime) {
      const now = Date.now();
      const remainingTime = cooldownEndTime - now;

      if (remainingTime > 0) {
        timerId = setTimeout(() => {
          setIsCooldownActive(false);
          setCooldownEndTime(null);
          setCooldownError(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCAL_STORAGE_COOLDOWN_KEY);
          }
          console.log("Global edit cooldown ended and localStorage cleared.");
        }, remainingTime);
      } else {
        // Cooldown already expired (e.g., due to system clock change or fast reload)
        setIsCooldownActive(false);
        setCooldownEndTime(null);
        setCooldownError(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_STORAGE_COOLDOWN_KEY);
        }
      }
    }
    return () => clearTimeout(timerId);
  }, [isCooldownActive, cooldownEndTime]);

  const triggerGlobalEditCooldown = () => {
    console.log("Global malicious input detected. Edit cooldown triggered.");
    const endTime = Date.now() + COOLDOWN_DURATION_MS;
    setCooldownEndTime(endTime);
    setIsCooldownActive(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_COOLDOWN_KEY, endTime.toString());
    }
    setCooldownError(`Malicious input attempt. Editing disabled globally for ${COOLDOWN_DURATION_MS / 1000 / 60} minutes.`);
  };

  const getGlobalCooldownRemainingTime = () => {
    if (!isCooldownActive || !cooldownEndTime) return "";
    const remaining = Math.max(0, Math.ceil((cooldownEndTime - Date.now()) / 1000 / 60));
    return `(Retry in ${remaining} min)`;
  };

  const clearGlobalCooldownError = () => {
    setCooldownError(null);
  };

  // For debugging/testing purposes if you need to clear it manually
  const clearCooldownManually = () => {
    setIsCooldownActive(false);
    setCooldownEndTime(null);
    setCooldownError(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_COOLDOWN_KEY);
    }
    console.log("Global cooldown manually cleared.");
  };


  return (
    <EditCooldownContext.Provider value={{
        triggerGlobalEditCooldown,
        getGlobalCooldownRemainingTime,
        isEditCooldownActive: isCooldownActive,
        editCooldownEndTime: cooldownEndTime,
        globalCooldownError: cooldownError,
        clearGlobalCooldownError,
        clearCooldownManually 
    }}>
      {children}
    </EditCooldownContext.Provider>
  );
};

export const useEditCooldown = () => {
  const context = useContext(EditCooldownContext);
  if (context === undefined) {
    throw new Error('useEditCooldown must be used within an EditCooldownProvider');
  }
  return context;
};