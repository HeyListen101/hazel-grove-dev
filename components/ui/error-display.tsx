// AuthMessageDisplay.tsx (Modified for success)
"use client";

import React from 'react';
import { X as CloseIcon, ShieldAlert, CheckCircle } from 'lucide-react'; // Added CheckCircle

interface AuthMessageDisplayProps {
  generalMessage?: string | null; // Error or general info
  successMessage?: string | null; // Specific for success
  lockdownMessage?: string | null;
  isLockdown?: boolean;
  onDismissGeneralError?: () => void;
  onDismissSuccessMessage?: () => void;
}

export const AuthMessageDisplay: React.FC<AuthMessageDisplayProps> = ({
  generalMessage,
  successMessage,
  lockdownMessage,
  isLockdown = false,
  onDismissGeneralError,
  onDismissSuccessMessage,
}) => {
  const messageToShow = isLockdown ? lockdownMessage : (successMessage || generalMessage);
  const isSuccess = !!successMessage && !generalMessage && !isLockdown; // Prioritize success display

  if (!messageToShow) {
    return null;
  }

  let bgColor = 'bg-red-100 border-red-300 text-red-700'; // Default error
  if (isLockdown) {
    bgColor = 'bg-yellow-100 border-yellow-400 text-yellow-800';
  } else if (isSuccess) {
    bgColor = 'bg-green-100 border-green-300 text-green-700'; // Success styling
  }

  const onDismiss = isSuccess ? onDismissSuccessMessage : onDismissGeneralError;
  const showDismissButton = !isLockdown && messageToShow && onDismiss;

  return (
    <div
      className={`relative mb-4 p-3 pr-10 ${bgColor} rounded-md text-sm w-full text-center`}
      role="alert"
    >
      {isLockdown && <ShieldAlert className="inline-block mr-2 h-5 w-5 align-text-bottom" />}
      {isSuccess && <CheckCircle className="inline-block mr-2 h-5 w-5 align-text-bottom" />}

      {!isLockdown && (generalMessage || successMessage) ? (
        // Assuming only generalMessage might contain HTML for now
        generalMessage && !isSuccess ? (
           <span dangerouslySetInnerHTML={{ __html: generalMessage }} />
        ) : (
          <span>{messageToShow}</span>
        )
      ) : (
        <span>{messageToShow}</span> // For lockdown messages or if neither general nor success
      )}

      {showDismissButton && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 text-current hover:opacity-75"
          aria-label="Dismiss message"
        >
          <CloseIcon size={18} />
        </button>
      )}
    </div>
  );
};