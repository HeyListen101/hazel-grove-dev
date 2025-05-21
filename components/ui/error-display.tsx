"use client";

import React from 'react';
import { X as CloseIcon, ShieldAlert } from 'lucide-react';

interface AuthMessageDisplayProps {
  generalMessage: string | null; // This can now contain HTML
  lockdownMessage?: string | null; // Keep this for consistency if used elsewhere
  isLockdown?: boolean;
  onDismissGeneralError?: () => void;
}

export const AuthMessageDisplay: React.FC<AuthMessageDisplayProps> = ({
  generalMessage,
  lockdownMessage,
  isLockdown = false, // Default to false
  onDismissGeneralError,
}) => {
  const messageToShow = isLockdown ? lockdownMessage : generalMessage;

  if (!messageToShow) {
    return null;
  }

  return (
    <div 
      className={`relative mb-4 p-3 pr-10 ${
        isLockdown 
          ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
          : 'bg-red-100 border-red-300 text-red-700' // Default error styling
      } rounded-md text-sm w-full text-center`} 
      role="alert"
    >
      {isLockdown && <ShieldAlert className="inline-block mr-2 h-5 w-5 align-text-bottom" />}
      
      {/* Render HTML safely for general messages */}
      {/* This is safe because we are controlling the HTML string on the server */}
      {!isLockdown && generalMessage ? (
        <span dangerouslySetInnerHTML={{ __html: generalMessage }} />
      ) : (
        <span>{messageToShow}</span> // For lockdown messages or if generalMessage is not HTML
      )}

      {!isLockdown && generalMessage && onDismissGeneralError && (
        <button
          type="button"
          onClick={onDismissGeneralError}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 text-current hover:opacity-75"
          aria-label="Dismiss error message"
        >
          <CloseIcon size={18} />
        </button>
      )}
    </div>
  );
};