// components/auth/ResetPasswordFormComponent.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Using Shadcn Button
import { resetPasswordAction } from "@/app/server/auth-actions";
import { AuthMessageDisplay } from '@/components/ui/error-display'; // Assuming this path

export function ResetPasswordFormComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [displayedGeneralError, setDisplayedGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialUrlErrorProcessed = useRef(false);

  useEffect(() => {
    const generalErrorFromUrl = searchParams.get('error');
    
    if (generalErrorFromUrl && !displayedGeneralError && !initialUrlErrorProcessed.current) {
        setDisplayedGeneralError(generalErrorFromUrl);
        initialUrlErrorProcessed.current = true; 

        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('error');
        const currentPath = window.location.pathname;
        router.replace(`${currentPath}?${newSearchParams.toString()}`, { scroll: false });
    } else if (!generalErrorFromUrl) {
        initialUrlErrorProcessed.current = false;
    }
  }, [searchParams, router, displayedGeneralError]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const dismissGeneralError = () => {
    setDisplayedGeneralError(null);
  };

  return (
    <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-7 text-black">Reset Password</h2>
      
      <AuthMessageDisplay 
        generalMessage={displayedGeneralError}
        lockdownMessage={null} // No lockdown feature here
        isLockdown={false}     // No lockdown feature here
        onDismissGeneralError={dismissGeneralError}
      />
      
      <form 
        action={resetPasswordAction} 
        className="w-full flex flex-col" 
        autoComplete="off"
      >
        <div className="relative mb-3">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New Password"
            className="input-field text-[#111111] text-sm w-full pr-10" // Added pr-10 for icon
            required
            aria-label="New Password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide new password" : "Show new password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative mb-6">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm New Password"
            className="input-field text-[#111111] text-sm w-full pr-10" // Added pr-10 for icon
            required
            aria-label="Confirm New Password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide confirm new password" : "Show confirm new password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <Button
          type="submit"
          className="bg-[#6B5C3D] text-white rounded-md font-semibold hover:bg-[#57503A] transition-colors w-full py-2.5"
          // Consider adding pending state if needed later
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}