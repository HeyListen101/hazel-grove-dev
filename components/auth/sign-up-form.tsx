// components/auth/SignUpFormComponent.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react'; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUpAction } from "@/app/server/auth-actions";
import { AuthMessageDisplay } from '@/components/ui/error-display'; 

export function SignUpFormComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [displayedGeneralError, setDisplayedGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>(""); // Initial state is empty string

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

  const dismissGeneralError = () => {
    setDisplayedGeneralError(null);
  };

  return (
    <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
      <h2 className="text-lg font-bold mb-3 text-black">Sign Up</h2>
      
      <AuthMessageDisplay 
        generalMessage={displayedGeneralError}
        lockdownMessage={null} 
        isLockdown={false}     
        onDismissGeneralError={dismissGeneralError}
      />
      
      <form 
        action={signUpAction} 
        className="w-full flex flex-col space-y-4" 
        autoComplete="off"
      >
        <Input 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          className="input-field text-sm text-[#111111]"
          required 
        />
        
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            className="input-field text-sm text-[#111111] w-full pr-10"
            required 
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input 
          type="text"
          name="username" 
          placeholder="Username" 
          className="input-field text-sm text-[#111111]"
          required 
        />

        <Select 
          name="affiliation_select" 
          onValueChange={setSelectedAffiliation} 
          value={selectedAffiliation} // This being "" initially will show the placeholder
          // `required` on Select itself might not work as expected for native validation.
          // Server-side validation for affiliation is key.
        >
          <SelectTrigger className="w-full bg-[#F5F5F5] text-[#111111] placeholder:text-muted-foreground focus:ring-0 focus:outline-none border-none">
            {/* The placeholder is defined here */}
            <SelectValue placeholder="Select Affiliation" /> 
          </SelectTrigger>
          <SelectContent className="bg-[#F5F5F5] text-[#111111] border-none shadow-lg">
            {/* REMOVED: <SelectItem value="">Select Affiliation</SelectItem> */}
            <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="visitor">Visitor</SelectItem>
            <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="student">Student</SelectItem>
            <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="staff">Staff</SelectItem>
            <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="faculty">Faculty</SelectItem>
            <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
        {/* Hidden input to ensure the 'affiliation' value is part of FormData */}
        {/* Only render hidden input if an actual affiliation is selected */}
        {selectedAffiliation && selectedAffiliation !== "" && <input type="hidden" name="affiliation" value={selectedAffiliation} />}
        
        <Button
          type="submit"
          className="bg-[#6B5C3D] text-white rounded-md font-semibold hover:bg-[#57503A] transition-colors w-full py-2.5"
        >
          Sign Up
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#6B5C3D] font-semibold underline">
          Log In
        </Link>
      </div>
    </div>
  );
}