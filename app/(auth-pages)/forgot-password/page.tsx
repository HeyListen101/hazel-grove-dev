// src/app/forgot-password/page.tsx
import { ForgotPasswordFormComponent } from "@/components/auth/forgot-password-form"; // Adjust path as needed
import backgroundImage from "@/components/assets/background-images/LandingPage.png"; // Adjust path as needed
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your account.',
};

// This page is now a simple Server Component wrapper.
// It no longer needs to handle searchParams directly for error display,
// as the client component ForgotPasswordFormComponent will manage that.
export default function ForgotPasswordPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white" // Matched style from ResetPasswordPage
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}
    >
      <ForgotPasswordFormComponent />
    </div>
  );
}