'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const COOLDOWN_DURATION_MINUTES = 10; // 10 minutes
const COOLDOWN_ERROR_MESSAGE_TEMPLATE = `Malicious input detected. Editing is disabled for {time}.`;

interface EditCooldownContextType {
  isEditCooldownActive: boolean;
  triggerGlobalEditCooldown: () => void;
  getGlobalCooldownRemainingTime: () => string;
  globalCooldownError: string | null;
  clearGlobalCooldownError: () => void; // To manually clear an error if needed
}

const EditCooldownContext = createContext<EditCooldownContextType | undefined>(undefined);

export const EditCooldownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Load initial cooldown state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEndTime = localStorage.getItem('editCooldownEndTime');
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        if (endTime > Date.now()) {
          setCooldownEndTime(endTime);
        } else {
          localStorage.removeItem('editCooldownEndTime'); // Clear if expired
        }
      }
    }
  }, []);

  const calculateAndSetRemainingTime = useCallback(() => {
    if (!cooldownEndTime || cooldownEndTime <= Date.now()) {
      setCooldownEndTime(null);
      if (typeof window !== 'undefined') localStorage.removeItem('editCooldownEndTime');
      setRemainingTime('');
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
      return '';
    }
    const diff = cooldownEndTime - Date.now();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const timeStr = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    setRemainingTime(timeStr);
    return timeStr;
  }, [cooldownEndTime, intervalId]);

  useEffect(() => {
    if (cooldownEndTime && cooldownEndTime > Date.now()) {
      calculateAndSetRemainingTime(); // Initial call
      const id = setInterval(() => {
        calculateAndSetRemainingTime();
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (cooldownEndTime && cooldownEndTime <= Date.now()) {
      // Handles case where cooldownEndTime was loaded but already expired
      setCooldownEndTime(null);
      if (typeof window !== 'undefined') localStorage.removeItem('editCooldownEndTime');
      setRemainingTime('');
    }
  }, [cooldownEndTime, calculateAndSetRemainingTime]);

  const triggerGlobalEditCooldown = useCallback(() => {
    const endTime = Date.now() + COOLDOWN_DURATION_MINUTES * 60 * 1000;
    setCooldownEndTime(endTime);
    if (typeof window !== 'undefined') localStorage.setItem('editCooldownEndTime', endTime.toString());
    // Remaining time will be updated by the useEffect managing the interval
  }, []);

  const clearGlobalCooldownError = useCallback(() => {
    // If you need to clear the visual error message without resetting the cooldown timer itself.
    // Currently, the error message is tied to isEditCooldownActive.
    // For now, this can be a no-op or used if a more nuanced error display is needed.
  }, []);
  
  const isEditCooldownActive = !!(cooldownEndTime && cooldownEndTime > Date.now());
  const globalCooldownError = isEditCooldownActive 
    ? COOLDOWN_ERROR_MESSAGE_TEMPLATE.replace('{time}', remainingTime || `${COOLDOWN_DURATION_MINUTES}m 00s`)
    : null;

  return (
    <EditCooldownContext.Provider value={{ 
      isEditCooldownActive, 
      triggerGlobalEditCooldown, 
      getGlobalCooldownRemainingTime: () => remainingTime,
      globalCooldownError,
      clearGlobalCooldownError
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