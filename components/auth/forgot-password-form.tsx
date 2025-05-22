// src/components/auth/ForgotPasswordFormComponent.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button"; // Using your existing SubmitButton
import { forgotPasswordAction } from "@/app/server/auth-actions"; // Ensure path is correct
import { AuthMessageDisplay } from '@/components/ui/error-display'; // Ensure path is correct

export function ForgotPasswordFormComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [displayedGeneralError, setDisplayedGeneralError] = useState<string | null>(null);
  const initialUrlErrorProcessed = useRef(false);

  useEffect(() => {
    let errorToDisplay: string | null = null;
    const errorCodeParam = searchParams.get('error_code');
    const messageParam = searchParams.get('message'); // This is typically the payload.message for error_code
    const generalErrorParam = searchParams.get('error'); // This is the message for type 'error'

    if (errorCodeParam && messageParam) {
      // Handle specific error_code structure, e.g., from INJECTION_ERROR
      // You might want to customize this message further based on the errorCodeParam value
      errorToDisplay = `Error: ${decodeURIComponent(messageParam)}`;
    } else if (generalErrorParam) {
      errorToDisplay = decodeURIComponent(generalErrorParam);
    }

    if (errorToDisplay && !displayedGeneralError && !initialUrlErrorProcessed.current) {
      setDisplayedGeneralError(errorToDisplay);
      initialUrlErrorProcessed.current = true;

      // Clear the error/message parameters from the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      newSearchParams.delete('error_code');
      newSearchParams.delete('message');
      
      const currentPath = window.location.pathname;
      const newQueryString = newSearchParams.toString();
      const newUrl = newQueryString ? `${currentPath}?${newQueryString}` : currentPath;
      
      router.replace(newUrl, { scroll: false });

    } else if (!errorCodeParam && !generalErrorParam) {
      // If no error params are in the URL, reset the flag
      initialUrlErrorProcessed.current = false;
      // Optionally, if displayedGeneralError is set but URL params are gone, clear displayedGeneralError too,
      // though this normally won't happen if router.replace works as expected.
      // if (displayedGeneralError) setDisplayedGeneralError(null);
    }
  }, [searchParams, router, displayedGeneralError]);

  const dismissGeneralError = () => {
    setDisplayedGeneralError(null);
    // Optionally, also ensure URL is clean if dismiss is clicked before useEffect's router.replace runs
    // (though generally not necessary if useEffect handles it robustly)
  };

  return (
    <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-7 text-black"> {/* Matched text-xl from ResetPasswordForm */}
        Forgot Password
      </h2>
      
      <AuthMessageDisplay 
        generalMessage={displayedGeneralError}
        lockdownMessage={null} // Assuming no lockdown feature for forgot password
        isLockdown={false}     // Assuming no lockdown feature for forgot password
        onDismissGeneralError={dismissGeneralError}
      />
      
      {/* The form action is handled by SubmitButton's formAction prop */}
      <form className="w-full flex flex-col" autoComplete="off">
        <Input
          type="email"
          name="email"
          placeholder="Email Address"
          className="input-field mb-4 text-sm text-[#111111]"
          required
          aria-label="Email Address"
        />
        
        <SubmitButton
          formAction={forgotPasswordAction}
          pendingText="Sending Reset Link..."
          // Matching style of ResetPasswordFormComponent's button
          className="bg-[#6B5C3D] text-white rounded-md font-semibold hover:bg-[#57503A] transition-colors w-full py-2.5"
        >
          Send Reset Link
        </SubmitButton>
      </form>

      <div className="mt-4 text-sm text-gray-600 text-center w-full">
        Suddenly remembered your password?
        <br />
        <Link href="/sign-in" className="text-[#6B5C3D] font-semibold underline">
          Log In
        </Link>
      </div>
    </div>
  );
}