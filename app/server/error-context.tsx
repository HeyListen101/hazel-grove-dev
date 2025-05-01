"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type ErrorContextType = {
  error: string | null;
  setError: (message: string | null) => void;
  clearError: () => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setErrorState] = useState<string | null>(null);

  const setError = (message: string | null) => {
    setErrorState(message);
  };

  const clearError = () => {
    setErrorState(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}