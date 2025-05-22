// components/auth/ResetPasswordFormComponent.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthMessageDisplay } from '@/components/ui/error-display'; // Your error display component
import { createClient } from "@/utils/supabase/client"; // Your client-side Supabase instance
// Import your utility functions if they are separate and can be run client-side
// For simplicity, I'll inline detectInjection here, or you can import it.

// Inlined or imported detectInjection function (ensure it can run client-side)
function detectInjection(input: string | undefined | null): boolean {
  if (!input) return false;
  const normalizedInput = input.trim().toLowerCase();
  const sqlPattern = /('|--|;|\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|FROM|WHERE)\b)/i;
  const htmlPattern = /<[^>]*>|javascript:|onerror=|onload=|alert\(|eval\(|document\.|window\./i;
  return sqlPattern.test(normalizedInput) || htmlPattern.test(normalizedInput);
}


export function ResetPasswordFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // For AuthMessageDisplay
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecoverySessionActive, setIsRecoverySessionActive] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySessionActive(true);
        // Optional: Clear URL hash after processing
        // window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    // Handle initial error from URL (e.g., if redirected from somewhere else with an error)
    const initialErrorFromUrl = searchParams.get('error');
    if (initialErrorFromUrl) {
      setError(decodeURIComponent(initialErrorFromUrl));
      // Clean the error from URL to prevent re-display on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
    }

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, router, searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // setSuccessMessage(null); // Not used in this version
  
    // --- VALIDATION LOGIC YOU WANT TO ADD ---
    // (Example from auth-actions - adjust password length as needed)
    if (detectInjection(password) || detectInjection(confirmPassword)) { // Assuming detectInjection is available
      setError("Tsk tsk tsk! No injections here!");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Password and password confirmation are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Match the password length from your auth-actions, e.g., 10
    // The "flawlessly working" code had 6. Let's assume 10 was intended from auth-actions.
    if (password.length < 10) {
      setError("Password must be at least 10 characters long.");
      return;
    }
    // --- END VALIDATION LOGIC ---
  
    setLoading(true);
  
    // OPTIONAL: A less strict check.
    // Before calling updateUser, quickly check if there's *any* user session.
    // The PASSWORD_RECOVERY event should have established one.
    // This is less direct than checking isRecoverySessionActive but can be a fallback.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        setError("Authentication session not ready. Please ensure you've used a valid recovery link or try refreshing the page.");
        setLoading(false);
        return;
    }
  
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });
  
    setLoading(false);
  
    if (updateError) {
      setError(updateError.message || "Failed to reset password. Please try again.");
    } else {
      const successRedirectMessage = encodeURIComponent('Password successfully reset. You can now log in with your new password.');
      router.push(`/sign-in?success=${successRedirectMessage}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-7 text-black">Reset Password</h2>

      {/* AuthMessageDisplay will show the 'error' state */}
      <AuthMessageDisplay
        generalMessage={error}
        onDismissGeneralError={() => setError(null)}
        // No successMessage prop needed here if redirecting on success
      />

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col"
        autoComplete="off"
      >
        <div className="relative mb-3">
          <Input
            type={showPassword ? "text" : "password"}
            name="password" // name attribute is not strictly necessary if not using FormData
            placeholder="New Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }} // Clear error on input change
            className="input-field text-[#111111] text-sm w-full pr-10"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide new password" : "Show new password"}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative mb-6">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword" // name attribute is not strictly necessary
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }} // Clear error on input change
            className="input-field text-[#111111] text-sm w-full pr-10"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide confirm new password" : "Show confirm new password"}
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          className="bg-[#6B5C3D] text-white rounded-md font-semibold hover:bg-[#57503A] transition-colors w-full py-2.5"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}