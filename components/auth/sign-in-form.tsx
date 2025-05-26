"use client";
//<script>kiddie</script>
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customSignInAction, googleSignInAction } from '@/app/server/auth-actions';
import { AuthMessageDisplay } from '@/components/ui/error-display'; // Corrected path based on your usage

const INJECTION_ERROR_MESSAGE_TEXT = "Tsk tsk tsk! No injections here!";
const INJECTION_ERROR_CODE_VALUE = "injection_detected";
const SESSION_STORAGE_LOCKDOWN_KEY = 'signInForm_inputLockdownActive';

export function SignInFormComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [displayedGeneralError, setDisplayedGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isInputLockdownActive, setIsInputLockdownActive] = useState(false);
  const [inputLockdownUserMessage, setInputLockdownUserMessage] = useState<string | null>(null);

  const initialUrlErrorProcessed = useRef(false); 
  const initialUrlInjectionProcessed = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedLockdown = sessionStorage.getItem(SESSION_STORAGE_LOCKDOWN_KEY);
        if (storedLockdown === 'true' && !isInputLockdownActive) {
            setIsInputLockdownActive(true);
            setInputLockdownUserMessage(INJECTION_ERROR_MESSAGE_TEXT + " Form is disabled for this session.");
        }
    }

    const errorCode = searchParams.get('error_code');
    const messageFromUrl = searchParams.get('message');
    const generalErrorFromUrl = searchParams.get('error');
    
    let newSearchParams = new URLSearchParams(searchParams.toString());
    let paramsToClear = false;

    if (errorCode === INJECTION_ERROR_CODE_VALUE && !initialUrlInjectionProcessed.current) {
        setIsInputLockdownActive(true);
        const lockdownMsg = messageFromUrl || INJECTION_ERROR_MESSAGE_TEXT;
        setInputLockdownUserMessage(lockdownMsg + " Form will be disabled.");
        setDisplayedGeneralError(null); 
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(SESSION_STORAGE_LOCKDOWN_KEY, 'true');
        }
        newSearchParams.delete('error_code');
        newSearchParams.delete('message');
        paramsToClear = true;
        initialUrlInjectionProcessed.current = true;
        initialUrlErrorProcessed.current = true;
    } else if (generalErrorFromUrl && !isInputLockdownActive && !displayedGeneralError && !initialUrlErrorProcessed.current) {
        setDisplayedGeneralError(generalErrorFromUrl);
        setInputLockdownUserMessage(null);
        newSearchParams.delete('error');
        paramsToClear = true;
        initialUrlErrorProcessed.current = true;
    }
    
    if (paramsToClear) {
        const currentPath = window.location.pathname;
        router.replace(`${currentPath}?${newSearchParams.toString()}`, { scroll: false });
    }

    if (!errorCode && !generalErrorFromUrl) {
        initialUrlErrorProcessed.current = false;
        initialUrlInjectionProcessed.current = false;
    }

  }, [searchParams, router, isInputLockdownActive, displayedGeneralError]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const dismissGeneralError = () => {
    if (!isInputLockdownActive) {
        setDisplayedGeneralError(null);
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
      <h2 className="text-lg font-bold mb-7 text-black">Log In</h2>
      
      <AuthMessageDisplay 
        generalMessage={displayedGeneralError}
        lockdownMessage={inputLockdownUserMessage}
        isLockdown={isInputLockdownActive}
        onDismissGeneralError={dismissGeneralError}
      />
      
      <form 
        action={customSignInAction}
        className="w-full flex flex-col" 
        noValidate
        autoComplete="off"
      >
        <Input 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          className="input-field mb-3 text-sm text-[#111111] w-full"
          required
          aria-label="Email Address"
          disabled={isInputLockdownActive}
        />
        
        <div className="relative mb-3">
          <Input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            className="input-field text-sm text-[#111111] w-full pr-10"
            required
            aria-label="Password"
            disabled={isInputLockdownActive}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-ring rounded-r-md"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isInputLockdownActive}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <div className="flex justify-between w-full text-sm mb-4">
          <Link href="/sign-up" className={`text-xs text-[#696047] ${isInputLockdownActive ? 'pointer-events-none opacity-50' : 'hover:underline'}`}>
            Sign Up or Register
          </Link>
          <Link href="/forgot-password" className={`text-xs text-[#696047] ${isInputLockdownActive ? 'pointer-events-none opacity-50' : 'hover:underline'}`}>
            Forgot Password?
          </Link>
        </div>
        
        <Button
          type="submit"
          className="bg-[#6B5C3D] text-white rounded-md font-semibold hover:bg-[#57503A] transition-colors w-full py-2.5"
          disabled={isInputLockdownActive}
        >
          {isInputLockdownActive ? "Form Disabled" : "Continue"}
        </Button>
      </form> 
      
      <div className="flex items-center w-full my-3">
        <hr className="flex-grow border-t border-[#d2d2d2] mx-2" />
        <span className="text-[#696047] font-medium text-base relative bottom-[3px]">or</span>
        <hr className="flex-grow border-t border-[#d2d2d2] mx-2" />
      </div>
      
      <form action={googleSignInAction} className="w-full flex justify-center">
        <Button
          type="submit"
          variant="outline"
          className="gsi-material-button"
          style={{ width: '320px' }}
          disabled={isInputLockdownActive}
        >
          {isInputLockdownActive ? (
             <div className="flex items-center justify-center w-full opacity-50">
                <ShieldAlert className="inline-block mr-2 h-5 w-5 align-text-bottom" />
                Disabled
             </div>
          ) : (
            <div className="gsi-material-button-content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 10px' }}>
                <div className="gsi-material-button-icon" style={{ marginRight: '10px' }}>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "24px", height: "24px" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                </div>
                <span className="gsi-material-button-contents" style={{ fontWeight: 500, fontSize: '14px' }}>Continue with Google</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}